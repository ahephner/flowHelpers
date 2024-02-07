import { LightningElement, api } from 'lwc';
import {sumByKey} from 'c/helper'
export default class FlowMathHelper extends LightningElement{
    items;
    key;
    value; 
    groupedItems;
       
    @api
    get inputValue(){
        return this.items ||[];
    } 
    set inputValue(data){
        this.items = data; 
    }
    @api 
    get keyValue(){
        return this.key || '';
    }
    set keyValue(data){
        this.key = data; 
    }
    @api 
    get valueInput(){
        return this.value || '';
    }
    set valueInput(data){
        this.value = data; 
        this.onStart();
    }
    async onStart(){
        if(this.items && this.key && this.value){
            this.groupedItems = await sumByKey(items, key, value);
    
            console.log(this.groupedItems)
        }
        console.log(`missing items ${this.items} or key ${this.key} or value ${this.value}`);
        
    }
}