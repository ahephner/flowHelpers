import { LightningElement, api, track } from 'lwc';
import {sumByKey} from 'c/helper'
import {
    FlowNavigationNextEvent, 
    FlowAttributeChangeEvent } from "lightning/flowSupport";
export default class GroupByField extends LightningElement {
    items;
    key;
    value; 
    groupByBack = [];
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
        
    }

    connectedCallback(){
        this.onStart();
    }
    async onStart(){
        if(this.items && this.key && this.value){
            this.groupedItems = await sumByKey(this.items, this.key, this.value);
    
            console.log(this.groupedItems)
        }
        console.log(`missing items ${this.items} or key ${this.key} or value ${this.value}`);
        if(this.groupedItems){
            //Need to save the records here not back in flow
            this.groupByBack = [...this.groupedItems];
            
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }
}
