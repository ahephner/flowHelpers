import { LightningElement, api, wire } from 'lwc';
import getContact from '@salesforce/apex/communityProvisionUser.getContact'; 
import insertUser from '@salesforce/apex/communityProvisionUser.insertUser';
import { FlowNavigationBackEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';
//import USER_OBJ from '@salesforce/schema/User';
// import FIRST_NAME from '@salesforce/schema/User.FirstName';
// import LAST_NAME from '@salesforce/schema/User.LastName';
// import EMAIL from '@salesforce/schema/User.Email';
// import USERNME from '@salesforce/schema/User.Username';
// import COMNICK from '@salesforce/schema/User.CommunityNickname';
// import TIME from '@salesforce/schema/User.TimeZoneSidKey';
// import LOCATION from '@salesforce/schema/User.LocaleSidKey';
// import EMAILENCODE from '@salesforce/schema/User.EmailEncodingKey'
// import ALIAS from '@salesforce/schema/User.Alias'
// import LANG from '@salesforce/schema/User.LanguageLocaleKey'
// import ACTIVE from '@salesforce/schema/User.IsActive'
// import PROFILEID from '@salesforce/schema/User.ProfileId';
export default class UserProvision extends LightningElement {
    @api contactId;
    @api userId;
    @api profileId
    @api profileName
    error
    contact; 
    //userObj = USER_OBJ; 
    firstName 
    lastName
    email;
    company;
    username; 
    nickName;
    phone; 
    alias;
    errorMessage;
    loaded = true; 

    //fields = [FIRST_NAME, LAST_NAME, EMAIL, USERNME, COMNICK, TIME, LOCATION, EMAILENCODE, ALIAS, LANG, ACTIVE]; 

    connectedCallback(){

        this.loadUser();
    }

    loadUser(){
        getContact({id: this.contactId})
        .then((result)=>{
            this.loaded = true;  
            this.firstName = result.FirstName;
            this.lastName = result.LastName;
            this.email = result.Email;
            this.userName = result.Email; 
            this.company = result.Account.Name;
            this.phone = result.Phone; 
            this.alias = result.FirstName.substring(0,1) + result.LastName.substring(0,5);
            this.nickName = this.firstName +" "+ this.lastName
            
        })
    }

    handleFName(e){
        this.firstName = e.detail.value;       
    }
    handleLName(e){
        this.lastName = e.detail.value;
    }

    handleEmail(e){
        this.email = e.detail.value;
    }
    handleUsername(e){
        this.userName = e.detail.value;
    } 
    handlePhone(e){
        this.phone = e.detail.value;
    }
    handleAlias(e){
        this.alias = e.detail.value;
    }
    handleNickname(e){
        this.nickName = e.detail.value;
    }

    save(){
        if(this.email === undefined || this.userName === undefined){
            alert('Email and UserName Required');
            return; 
        }
        this.loaded = false; 
        let params ={
            fName : this.firstName,
            lName: this.lastName,
            email: this.email,
            uName : this.userName,
            company: this.company,
            phone: this.phone,
            alias: this.alias,
            nickname: this.nickName,
            profileId : this.profileId,
            contactId: this.contactId
        }
        
        insertUser({wrapper:params})
            .then((resp)=>{
                if(resp === 'Success'){
                    const next = FlowNavigationNextEvent();
                    this.dispatchEvent(next); 
                    this.loaded = true; 
                }else if(resp != 'Success'){
                    this.errorMessage = resp;
                    this.loaded = true; 
                }

            }).catch((error)=>{
                console.log(JSON.stringify(error))
                let message = 'Unknown error';
                if (Array.isArray(error.body)) {
                    message = error.body.map(e => e.message).join(', ');
                    this.errorMessage = message; 
                } else if (typeof error.body.message === 'string') {
                    message = error.body.message;
                    this.errorMessage = message; 
                }
         })
        }

        back(){
            const backNav = FlowNavigationBackEvent();
            this.dispatchEvent(backNav);
        }
    
}

// @wire(getContact, {id: '$contactId'})
//         wiredContact({data, error}){
//             if(data){
//                this.contact = data
//                this.copy = this.contact; 
//                console.log(this.copy);
//                  this.firstName = this.copy.FirstName;
//                  this.lastName = this.copy.LastName;
//                  this.email = this.copy.Email;
//                  this.userName = this.copy.Email; 
//                  this.company = this.copy.Company_Name__c;
//                  this.phone = this.copy.Phone; 
//                  this.alias = this.copy.FirstName.substring(0,1) + this.copy.LastName.substring(0,8);
//                  this.nickName = this.firstName +" "+ this.lastName

//             }else if(error){
//                 this.error = JSON.stringify(error);
//                 console.log(error); 
//             }
//     }