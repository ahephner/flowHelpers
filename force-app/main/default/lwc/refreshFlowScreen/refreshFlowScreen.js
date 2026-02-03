import { LightningElement, api } from 'lwc';
import { RefreshEvent } from 'lightning/refresh';
import { FlowNavigationFinishEvent } from 'lightning/flowSupport';
export default class RefreshFlowScreen extends LightningElement{
    connectedCallback(){
        this.handleRefresh(); 
    }
 @api availableActions = [];  // Flow available actions (e.g., NEXT, FINISH)
  nextMove   
    handleRefresh(){
        this.dispatchEvent(new RefreshEvent());
        try{
        if(this.availableActions.includes('NEXT')){
            this.nextMove= new CustomEvent('next');
            this.dispatchEvent(this.nextMove);
        }else if(this.availableActions.includes('FINISH')){
            this.nextMove = new CustomEvent('finish');
            this.dispatchEvent(this.nextMove);
        }
        }catch(error){
            console.error(error);
            
        }

    }
}