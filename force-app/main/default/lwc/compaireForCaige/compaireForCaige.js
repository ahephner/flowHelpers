import { LightningElement, api, track } from 'lwc';
//import priorityPrice from '@salesforce/apex/getPriceBooks.priorityBestPrice';
import allAppProducts from '@salesforce/apex/appProduct.allAppProducts';
import { priorityPricing} from 'c/helperOMS';
 import getPriceBooks from '@salesforce/apex/getPriceBooks.getPriceBookIds';
import basicInfo from '@salesforce/apex/appProduct.basicInfo';

import { appTotal, alreadyAdded, pref,calcDryFert, calcLiqFert, unitsRequired, roundNum, pricePerUnit, perProduct, merge, areaTreated, sumFert, totalUsed,lowVolume, lvUnits } from 'c/programBuilderHelper';
import {checkPricing, sumByKey} from 'c/helper'
export default class CompaireForCaige extends LightningElement {
    
    @track pinnedProducts = [];       // Product to be pinned
    @track tableProduct = [];      // Table Product
    columns = [];
    @api recordId;
    showValue;
    
//price book ids
    pbIds; 
//acccount id get basicInfo will set this. call after product load
    accId;
    // Columns for Table only showing Name and Price till we get data on the table
    columns = [
        { label: 'Label', fieldName: 'label' },
        { label: 'Report Rate', fieldName: 'rate2'},
        { label: 'Unit Measure', fieldName: 'unitMeasure' },
        { label: 'Value', fieldName: 'value', type: 'currency'},
        { label: 'N', fieldName: 'nVal', type: 'number' },
        { label: 'P', fieldName: 'pVal', type: 'number' },
        { label: 'K', fieldName: 'kVal', type: 'number' },
        { label: 'Cost Per M', fieldName: 'costPerM', type: 'currency' },
        { label: 'Cost Per Acre', fieldName: 'costPerAcre', type: 'currency' },
        { label: 'Total Used', fieldName: 'totalUsed', type: 'number' }
    ];
               //for the combo box 
           get unitArea(){
            return [
                {label:'OZ/M', value:'OZ/M'}, 
                {label: 'OZ/Acre', value:'OZ/Acre'},
                {label: 'LB/M', value:'LB/M'},
                {label: 'LB/Acre', value:'LB/Acre'},
                {label:'100 Gal', value:'100 Gal'}
            ];
        }
    connectedCallback() {
        console.log('Record ID:', this.recordId);
        if (this.recordId) {
            this.fetchProgramProducts();
        }
    }
    //renderedCallback  => Fires more if the above is not workable MUST have a if statement ie
    //renderedCallbackt(){
    // if(!alreadyLoaded ){ call load function then set this.alreadyLoaded = true}}

    //     // ("$recordId") 

    // Look at This need applicationID not recID
    //maybe take a look at async in here because we may need to call a lot of differnt methods or we may just do in connectedCallback
    fetchProgramProducts(){
        console.log("This is the Start")
        allAppProducts({ rec: this.recordId })
            .then(result => {
                console.log(result)
                //look at return in here
                //https://github.com/ahephner/devsb1/blob/main/force-app/main/default/lwc/updateRatePrice/updateRatePrice.js
                this.pinnedProducts = result.map((item,index) => {
                    let id = item.Id;
                    let label = item.Product_Name__c;
                    let rate2 = item.Rate2__c;
                    let unitMeasure = item.Unit_Area__c;
                    let price = item.Unit_Price__c;
                    let isFert = item.Product__r.hasFertilizer__c
                    let N__c = !item.Product__r.hasFertilizer__c ? 'N/A': item.Product__r.N__c;
                    let P__c = !item.Product__r.hasFertilizer__c ? 'N/A': item.Product__r.P__c;
                    let K__c = !item.Product__r.hasFertilizer__c ? 'N/A': item.Product__r.K__c;
                    let costPerM = item.Cost_per_M__c;
                    let costPerAcre = item.Cost_per_Acre__c;
                    let totalUsed = item.Total_Used_f__c;
                    let firstItem = index >= 1 ? false: true; 
                    return {...item, id, label, rate2, isFert, unitMeasure, price, N__c, P__c, K__c, costPerM, costPerAcre, totalUsed,firstItem};
                });
                //unique could have 3 quicksilvers but only need to display 1
                
                this.buildProdFilter(this.pinnedProducts)
                this.showValue = '';
            })
            .catch(error => {
                console.error('Error fetching program products', error);
            });
        console.log("This is the End")    
    }
    
        buildProdFilter(data){
        console.log(data)
        let initArray= [];
        for(let i = 0; i<data.length; i++){
            let name = data[i].label;
            let id = data[i].Product__c;
            
            let obj = {label:name, value:id, Id:id}
            initArray.findIndex(x=>x.label === obj.label) === -1 ? initArray.push(obj) : '';
           // this.allProds.push(obj)
        }
        
        //{label:'search', value:'search'},
        this.productList = [{label:'Pick Product', value:'Pick Product'}, ...initArray];
        this.showValue = 'Pick Product';  
        
    }
    filterProd(event) {
        console.log('Filter Product:', event.target.options);
        console.log(event.target.value);
        console.log(event.recordId);
        const selectedId = event.target.value;
        if (!selectedId){
            this.tableProduct = [];
            return;
        }
        // Only display the selected product  
        const selectedProduct = this.pinnedProducts.find(p => p.Product__c === selectedId);
        this.tableProduct = selectedProduct ? [selectedProduct] : [];
        this.showCompareBtn = true;
        this.showComboBox = false;
        this.number = 0; 
    }

    
    btnName = 'first'
    // This is the event when the user clicks Compare
    handleAddToCompare(event) {
        // Updates the interface and empties table product
        let name = event.target.name
        switch (name) {
            case 'first':
                this.btnName = 'second';
                this.showCompareBtn = false;
                this.searchProd = true; 
                break;
            case 'second':
                this.btnName = 'third';
                this.showCompareBtn = false;
                this.searchProd = true; 
                break
            case 'third':
                this.btnName = 'fourth';
                this.showCompareBtn = false;
                this.searchProd = true; 
                break
            default:
                break;
        }
    }
    maxPick = false; 
    number = 0
    handleProductSelect(evt){
       let prodId = evt.detail //this is product2 id
        //apex call here to get the product info
        
        //handleMove
        this.handleNextView(this.number, 'forward'); 
    }
//need to work on reset like pick a new proudct this needs to go back to zero 
    handleNextView(num, type){
        if(this.number >= 4)return

        switch (true) {
            case (num === 0 && type === 'forward'):
                this.number ++
                let placeOne = {id: '3', label: 'Place One'}
                ///here we would add product to table
                this.tableProduct = [...this.tableProduct, placeOne]
                this.searchProd = false;
                this.showCompareBtn = true; 
                break;
            case (num === 1 && type === 'forward'):
                this.number ++
                let placeTwo = {id: '4', label: 'Place Two'}
                ///here we would add product to table
                this.tableProduct = [...this.tableProduct, placeTwo]
                this.searchProd = false;
                this.showCompareBtn = true;
                break;
            case (num === 3 && type === 'forward'):
                this.searchProd = false;
                let placeThree = {id: '5', label: 'Place Three'}
                ///here we would add product to table
                this.tableProduct = [...this.tableProduct, placeThree]
                this.maxPick = true
                break
            default:
                break;
        }
    }
        handleReplacement(event){
            const name = event.target.name;
        }
    //MATH FUNCTIONS 
    //use this.productList = single values we can then do a mass update in apex

    //!***!*!*!*!*! These need to go to programHelper in Full/ Prod assuming one acre size for now 
    async calcDryFertCompare(numRate, item){
        let x = item; 
        let n = x.N__c > 0 ? x.N__c/100 : 0;
        let p = x.P__c > 0 ? x.P__c/100 : 0; 
        let k = x.K__c > 0 ? x.K__c/100 : 0; 
        n = await this.handleFertilizerRate(n, numRate, x.Unit_Area__c);
        p = await  this.handleFertilizerRate(p, numRate, x.Unit_Area__c);
        k = await this.handleFertilizerRate(k, numRate, x.Unit_Area__c);
        return {n,p,k};
    }
    //wont need call from helper NEED TO EXPORT IT 
    handleFertilizerRate = (percent, rate, rateType) =>{
        let value = rateType.includes('Acre') ? (rate / 43.56)* percent : rate * percent;
        value = roundRate(value, 4)
        return value;
    } 
    //Rate
    handleRate(item){
        let index = this.tableProduct.findIndex(x=> x.Product__c === item.target.name); 

        window.clearTimeout(this.delay);

        this.delay = setTimeout(()=>{
            this.tableProduct[index].Rate2__c = Number(item.detail.value);

            if(this.tableProduct[index].Unit_Area__c != '' && this.tableProduct[index].Unit_Area__c != null && this.tableProduct[index].Unit_Area__c != '100 Gal' ){
                    this.tableProduct[index].Units_Required__c = unitsRequired(this.tableProduct[index].Unit_Area__c, this.tableProduct[index].Rate2__c, this.areaSizeM, this.tableProduct[index].Product_Size__c )    
                    this.tableProduct[index].totalUsed = totalUsed(this.tableProduct[index].Unit_Area__c, this.areaSizeM, this.tableProduct[index].Rate2__c);
                    this.tableProduct[index].Total_Price__c = roundNum(this.tableProduct[index].Units_Required__c * this.tableProduct[index].Unit_Price__c, 2);

                    let prodCost = pricePerUnit(this.tableProduct[index].Unit_Price__c, this.tableProduct[index].Product_Size__c, this.tableProduct[index].Rate2__c,this.tableProduct[index].Unit_Area__c);
                    this.tableProduct[index].Cost_per_M__c = prodCost.perThousand;
                    this.tableProduct[index].Cost_per_Acre__c = prodCost.perAcre; 
                    //this.productIds.includes(this.tableProduct[index].Product__c) ? '': this.productIds.push(this.tableProduct[index].Product__c);

                    //fert info 
                    if(this.tableProduct[index].isFert){
                        let fert = this.tableProduct[index].Product_Type__c === 'Dry' ? this.calcDryFertCompare(this.tableProduct[index].Rate2__c, this.tableProduct[index]) : calcLiqFert(this.tableProduct[index].Rate2__c, this.tableProduct[index]);
                        this.tableProduct[index].N__c = fert.n;
                        this.tableProduct[index].P__c = fert.p;
                        this.tableProduct[index].K__c = fert.k;
                        //let totalFert = sumFert(this.tableProduct)
                        //this.appTotalN = roundNum(totalFert.N__c, 4);
                        //this.appTotalP = roundNum(totalFert.P__c, 4);
                        //this.appTotalK = roundNum(totalFert.K__c, 4);

                    }else{
                        this.tableProduct[index].N__c = 0;
                        this.tableProduct[index].P__c = 0;
                        this.tableProduct[index].K__c = 0;
                   }
            }else if(this.tableProduct[index].Unit_Area__c ==='100 Gal'){
                    this.tableProduct[index].isLowVol__c = true; 
                    this.tableProduct[index].unitAreaStyles = 'slds-col slds-size_2-of-12 lowVolume'
                    this.tableProduct[index].Rate2__c = Number(e.detail.value)
                    let {Rate2__c, Product_Size__c, Spray_Vol_M__c, Unit_Price__c} = this.tableProduct[index];
    
                    if(Spray_Vol_M__c>0 && Rate2__c> 0){
                       
                        let finished = lowVolume(Rate2__c, Product_Size__c, Spray_Vol_M__c, Unit_Price__c) 
                        
                        //updateValues
                        this.tableProduct[index].Units_Required__c = lvUnits(this.areaSizeM, Spray_Vol_M__c, Product_Size__c, Rate2__c);
                        this.tableProduct[index].Total_Price__c = roundNum(this.tableProduct[index].Units_Required__c * this.tableProduct[index].Unit_Price__c, 2);
                        
                         
                        this.tableProduct[index].Cost_per_M__c = finished.singleThousand;
                        this.tableProduct[index].Cost_per_Acre__c = finished.singleAcre;
                        this.tableProduct[index].Acres_Treated__c = finished.acresTreated;
                        //this.prodCostM = finished.singleThousand;
                        //this.prodCostA = finished.singleAcre;
                        //this.treatedAcreage = finished.acresTreated
                        //this.prodAreaCost = this.areaAcres * this.costPerAcre;
                        
                        //this.appTotalPrice = appTotal(this.tableProduct); 
                        //this.totalCostPerM = roundNum(Object.values(this.tableProduct).reduce((t,{Cost_per_M__c})=>t+Cost_per_M__c,0),2)
                    }
                }
        }, 500)

    }

    handleUnitArea(x){

    }

    handlePrice(x){
        
    }
}