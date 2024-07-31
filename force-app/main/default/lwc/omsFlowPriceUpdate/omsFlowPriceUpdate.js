import { LightningElement, api, wire } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPriceBooks from '@salesforce/apex/getPriceBooks.getPriceBookIds';
import getCartItems from '@salesforce/apex/flowHelpers.getCartItems'; 
import HAS_PRICEBOOK from '@salesforce/apex/omsPricingTool.pricebookFound';
import NO_PRICEBOOK from '@salesforce/apex/omsPricingTool.createAllTheThings';
import { roundNum } from 'c/helper';

export default class OmsFlowPriceUpdate extends LightningElement {
    cartId; 
    cartItems = []; 
    errorMsg; 
    noBooks; 
    wiredCartResult;
    account; 
    accBased; 
    loading = true; 
    @api
    get shopCartId(){
        return this.cartId || '';
    }

    set shopCartId(data){
        this.cartId = data; 
        console.log('CartId set:', this.cartId);
    }
    connectedCallback(){
        this.loadValues()
    }
    async loadValues(){
        let data = await getCartItems({cId: this.cartId});
        console.log('Data received:', JSON.stringify(data, null, 2));
        this.cartItems = data.map(item => {
            const mappedItem = {
                ...item,
                sObjectType: 'CartItem',
                margin: this.calculateMargin(item.SalesPrice, item.Product2.Product_Cost__c),
                readonly: item.Product2.Agency_Pricing__c
            };
            this.account = data[0].Cart.AccountId; 
            return mappedItem;
        });
        let books = await getPriceBooks({accountId: this.account})
        console.log('books ', books)
        if(books.length>0){
            books = books.filter((x)=>x.Priority===2);
            this.accBased = books.length ===1 ?  books[0].Pricebook2Id : false; 
        }
        this.loading = false; 
    }
    
    // helper to calculate margin
    calculateMargin(revenue, cost) {
        console.log(`Calculating margin - Revenue: ${revenue}, Cost: ${cost}`);
        if (typeof revenue !== 'number' || typeof cost !== 'number' || revenue === 0) {
            console.warn('Invalid input or zero revenue, returning 0');
            return 0;
        }
        const margin = roundNum(((revenue - cost) / revenue) * 100, 2);
        console.log(`Calculated margin: ${margin}%`);
        return margin;
    }

    // method to update price based off user input that will update margin put a setTimeOut on 
    updatePrice(event) {
        const id = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Price update triggered - ID: ${id}, New Value: ${value}`);
    
        // Clear any existing timeout
        if (this.updatePriceTimeout) {
            clearTimeout(this.updatePriceTimeout);
        }
    
        // Set a new timeout
        this.updatePriceTimeout = setTimeout(() => {
            console.log(`Updating price after timeout - ID: ${id}, New Value: ${value}`);
            const updatedItem = this.cartItems.find(item => item.Id === id);
            if (updatedItem) {
                updatedItem.SalesPrice = parseFloat(value);
                updatedItem.margin = this.calculateMargin(updatedItem.SalesPrice, updatedItem.Product2.Product_Cost__c);
                console.log(`Updated item after price change: ${JSON.stringify(updatedItem, null, 2)}`);
                this.cartItems = [...this.cartItems];
            } else {
                console.warn(`Item with ID ${id} not found`);
            }
        }, 500); // 500 milliseconds = 0.5 seconds
    }

    // method to update margin based off user input that will update the sales price put a setTimeOut on 
    updateMargin(event) {
        const id = event.target.dataset.id;
        const value = event.target.value;
        console.log(`Margin update triggered - ID: ${id}, New Value: ${value}`);
    
        // Clear any existing timeout
        if (this.updateMarginTimeout) {
            clearTimeout(this.updateMarginTimeout);
        }
    
        // Set a new timeout
        this.updateMarginTimeout = setTimeout(() => {
            console.log(`Updating margin after timeout - ID: ${id}, New Value: ${value}`);
            const updatedItem = this.cartItems.find(item => item.Id === id);
            if (updatedItem) {
                const newMargin = parseFloat(value) / 100; // Convert percentage to decimal
                const cost = updatedItem.Product2.Product_Cost__c;
                updatedItem.SalesPrice = roundNum(cost / (1 - newMargin), 2);
                updatedItem.margin = parseFloat(value);
                console.log(`Updated item after margin change: ${JSON.stringify(updatedItem, null, 2)}`);
                this.cartItems = [...this.cartItems];
            } else {
                console.warn(`Item with ID ${id} not found`);
            }
        }, 500); // 500 milliseconds = 0.5 seconds
    }

    // method to save changes using updateRecord, after successful update, it forces a window reload
    saveChanges() {
        console.log('Saving changes...');
        this.loading = true; 
        if(this.accBased){
            HAS_PRICEBOOK({pbId: this.accBased ,prods:this.cartItems})
                .then((res)=>{
                    if(res==='success'){
                        this.showSuccessToast(res)
                    }else{
                        this.showErrorToast(res);
                    }
                })
        }else{
            NO_PRICEBOOK({accountId: this.account, products: this.cartItems})
                .then((res)=>{
                    if(res==='New Price Book Created'){
                        this.showSuccessToast(res)
                    }else{
                        this.showErrorToast(res);
                    }
                })
        }
        this.loading = false; 
    }

    refreshCartItems() {
        console.log('Refreshing cart items');
        return refreshApex(this.wiredCartResult)
            .then(() => {
                console.log('Cart items refreshed successfully');
            })
            .catch(error => {
                console.error('Error refreshing cart items:', error);
                this.showErrorToast('Error refreshing cart items');
            });
    }

    showSuccessToast(message) {
        console.log(`Showing success toast: ${message}`);
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
        }));
    }

    showErrorToast(message) {
        console.log(`Showing error toast: ${message}`);
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
        }));
    }
}