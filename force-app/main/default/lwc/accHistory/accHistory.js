//does not work 
import { LightningElement, api } from 'lwc';
import getPickListValues from '@salesforce/apex/lwcHelper.getPickListValues';
import getPageRef from '@salesforce/apex/customerSearchDocController2.customerSearchDocController2'

export default class AccHistory extends LightningElement {
    @api recordId; 
    dOne;
    dTwo;
    famOpts;
    familyPicked;   
    connectedCallback(){
        this.findFamilies()
    }

    findFamilies(){
        getPickListValues({objName:'Product2', fieldAPI:'Product_Family__c'})
            .then((x)=>{
                this.famOpts = x; 
            })
    }
    handleFamily(evt){
        this.familyPicked = evt.detail.value; 
    }
    dateOne(event){
        this.dOne = event.target.value;
    }
    dateTwo(event){
        this.dTwo = event.target.value; 
    }
    handleClick(){
        getPageRef({accId: this.recordId, firstDate: this.dOne, endDate: this.dTwo, family: this.familyPicked})
            .then((x)=>{
                console.log('here')
                console.log(x)
            }).catch((error)=>{
                console.error(error)
            })
    }
}