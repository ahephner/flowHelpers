import { LightningElement, api, track } from 'lwc';
import {FlowNavigationBackEvent,
    FlowNavigationNextEvent, 
    FlowAttributeChangeEvent } from "lightning/flowSupport";

export default class SearchDataSetByField extends LightningElement {
    items; 
    label
    searchCol;
    
    @track displayText = []; 
    searchKey
    @api selectedIds = []; 
    @api
    get inputValue(){
        return this.items ||[];
    } 
    set inputValue(data){
        this.items = data; 
        
    }

    @api 
    get labelString(){
        return this.label || 'Search';
    }
    set labelString(data){
        this.label = data; 
    }
    @api
    get searchField(){
        return this.searchCol;
    }
    set searchField(data){
        this.searchCol = data; 
        this.onStart();
    }
    async onStart(){
        let searchVal = this.searchCol
        this.label = this.labelString.length > 0 || this.labelString != undefined ? this.labelString : 'Search Data'
        this.items = this.items.map(item=>{
            //css class
            let checked = false;
            //for search
            let searchName = item.Name.toLowerCase() + ' '+item[searchVal].toLowerCase(); 
            return {...item, checked, searchName}
        }); 
        this.displayText = [...this.items]
    }

    handleSearch(event){
        
        const searchKey = event.target.value.toLowerCase();
        window.clearTimeout(this.delayTimeout);   
            this.delayTimeout = setTimeout(() =>{
                let base =  JSON.parse(JSON.stringify(this.items))
                
                let narrowed = base.filter(item => { 
                   return item.searchName.toLowerCase().includes(searchKey); 
                });
                
            this.displayText = [...narrowed]
                
            }, 400);
    }

    handleClick(event){
        event.preventDefault();
        let index = this.displayText.findIndex(item => item.Id === event.target.name)
        if(index != -1){
            let check = !this.displayText[index].checked
            
            this.displayText[index].checked = check; 
            this.items[index].checked = check; 
            this.displayText = [...this.displayText]; 
            this.items = [...this.items];
            !check ? this.removeId(this.displayText[index].Id) : this.selectedIds.push(this.displayText[index].Id)
        }

    }
    removeId(id){
        let x = this.selectedIds.indexOf(id);
        this.selectedIds.splice(x, 1); 
    }

    handleBack(){
        const navigateNextEvent = new FlowNavigationBackEvent();
        this.dispatchEvent(navigateNextEvent);
    }

     moveFoward(){
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedIds', this.selectedIds))
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent);
    }
}