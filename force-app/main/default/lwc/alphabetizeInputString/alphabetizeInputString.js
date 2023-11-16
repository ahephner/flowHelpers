import { LightningElement, api } from 'lwc';
import getPickListValues from '@salesforce/apex/lwcHelper.getPickListValues'; 
import {FlowNavigationBackEvent,
        FlowNavigationNextEvent, 
        FlowAttributeChangeEvent } from "lightning/flowSupport";
//const REGEX_STOCK_RES = /(stock|sock|limited|limted|lmited|limit|close-out|close out|closeout|close  out|exempt|exmpet|exemept|southern stock|southernstock|southner stock)/g; 
const REGEX_COMMA = /(,)/g;
const REGEX_24D = /2,4-D|2 4-d|2, 4-D| 2,=D | 2 =D/gi
const REGEX_SLASH = /-/g; 
const REGEX_FERT = /(\d{1,2}\s*-)(\s*\d{1,2}\s*-)(\s*\d{1,2})/g; 
const REGEX_NOWHITESPACE = /\s/g
export default class AlphabetizeInputString extends LightningElement {
    @api userInput
    categories
    @api category
    searchString=''; 
    isFert; 
    searchTerm;
    errorMsg = {};
    localError = false; 
    showSpin = true; 
    connectedCallback(){
        this.init(); 
    }

    async init(){
        let pickList = await getPickListValues({objName:'Search_Label__c',fieldAPI:'Label_Category__c' })
        let back = await pickList.map((item)=>({
            ...item, 
            label: item.label,
            value:item.value
        }))
        back.unshift({label:'None', value:'None'})
        this.categories = [...back]
        //stop spinner
        this.showSpin = false; 
    }

    handleCategory(x){
        this.category = x.detail.value;
    }

    makeString(){
        let search = this.template.querySelector('[data-value="userInput"]').value
        if(search.length > 3){
            this.isFert = search.match(REGEX_FERT);
            //if fertilizer remove any mistaken which space
            this.isFert = !this.isFert ? '' : this.isFert[0].replace(REGEX_NOWHITESPACE, ''); 
            //grab non fertilizer search inputs. 2,4-D is a common product the ',' causes issues. Remove Fertilizer, Escape Hyphen,  Commas  add the 'and' to filter ie car , red  query would be car and red
            //remove stock status that is in the where clause of nested soql. Trim the search. 
            let cleanUp = search.replace(REGEX_24D, '2 4-D').replace(REGEX_FERT,'').replace(REGEX_SLASH,'\-').replace(REGEX_COMMA, ' and ').split(' ').sort().join(' ').trim();
            //need to combine fert and searchTerm
            let finalSearch =  `${this.isFert} ${cleanUp}`
            return finalSearch; 
        }

    }
    //make sure it is all filled out
    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        //console.log(1, inputFields, 2, ship)
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
            
            this.errorMsg[inputField.name] = inputField.value;
        });
        return isValid;
    }

    async moveNext(){
        let ok = this.isInputValid();
        if(ok){
            this.showSpin = true; 
            this.localError = false; 
            this.searchTerm = await this.makeString(); 
            this.dispatchEvent(new FlowAttributeChangeEvent('userInput', this.searchTerm))
            this.dispatchEvent(new FlowAttributeChangeEvent('category', this.category))
    
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    moveBack(){
        const navigateNextEvent = new FlowNavigationBackEvent();
        this.dispatchEvent(navigateNextEvent);
    }
}