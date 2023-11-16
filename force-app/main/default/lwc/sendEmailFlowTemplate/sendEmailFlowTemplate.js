import { LightningElement, api } from 'lwc';

export default class SendEmailFlowTemplate extends LightningElement{
    _automaticOutputVariables = []; 
    _inputVariables = []
//get builderContext this is what it's called in the flows. 
//its the input values user passes in
//this is for manual variables stored in the flow
    @api get inputVariables(){
        return this.inputVariables;
    }

    set inputVariables(value){
        this.inputVariables = value; 
    }

//this is optionional but it get automatic variables like formula out put from flows
    @api get automaticOutputVariables(){
        return this._automaticOutputVariables;
    }
    
    set automaticOutputVariables(values){
        this._automaticOutputVariables = values; 
    }
}