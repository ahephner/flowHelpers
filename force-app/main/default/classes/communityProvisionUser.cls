public without sharing class communityProvisionUser {


    @AuraEnabled
    public static contact getContact(string id){
        contact con = [select id, email, firstname, lastname, phone, Account.Name from contact where id = :id limit 1];
        system.debug(con);
        return con; 
    }
    @AuraEnabled
    public static string insertUser(communityWrapper wrapper){
        string mess;  
        User newUser = new User(
            firstName = wrapper.fName,
            lastName = wrapper.lName,
            email = wrapper.email,
            username = wrapper.uName,
            phone = wrapper.phone,
            alias = wrapper.alias,
            CommunityNickname = wrapper.nickname,
            ProfileId = wrapper.profileId,
            contactId = wrapper.contactId,
            isActive = true,
            EmailEncodingKey='ISO-8859-1', 
			LanguageLocaleKey = 'en_US',
			LocaleSidKey = 'en_US',
			TimeZoneSidKey = 'America/New_York'
        );
        try{
        	insert newUser; 
            mess = 'Success';
        }catch(exception e){
            system.debug(e);
            mess = String.valueOf(e); 
        }
        
        return mess; 
    }
    
    //user provision for campaign
    public class inputVariables{
        @InvocableVariable
        public string alias;
        
        @InvocableVariable
        public string nickName;
        
        @InvocableVariable
        public string companyName;
        
        @InvocableVariable
        public string contactId;
        
        @InvocableVariable
        public string email;
        
        @InvocableVariable
        public string fName;
        
        @InvocableVariable
        public string lName;
        
        @InvocableVariable
        public string userName; 
        
        @InvocableVariable
        public string profileId; 
        
        @InvocableVariable
        public string phone;
        
        @InvocableVariable
        public boolean ShopATS;
        
        //One of the permission sets is hidden via managed package doing it this way lets us add manually
        @InvocableVariable
        public string permBuyerId;
        
        @InvocableVariable
        public string permStoreId;
        
    }
    
    @InvocableMethod(label='Add User to Golf Store' description='creates user and adds perms of: 0PS2M000001mkHbWAI, 0PSVH0000004eq54AA ' )
    public static list<string> createCampaignUser(list<inputVariables> params){
        inputVariables info = params[0];
        list<string> messBack;
        string mess; 
        User newUser = new User(
            firstName = info.fName,
            lastName = info.lName,
            email = info.email,
            username = info.userName,
            phone = info.phone,
            alias = info.alias,
            CommunityNickname = info.nickName,
            ProfileId = info.profileId,
            contactId = info.contactId,
            isActive = true,
            EmailEncodingKey='ISO-8859-1', 
			LanguageLocaleKey = 'en_US',
			LocaleSidKey = 'en_US',
			TimeZoneSidKey = 'America/New_York',
            Shop_ATS_User__c = info.ShopATS
        );
        try{
        	insert newUser; 
            
            List<PermissionSetAssignment> permissionSetList = new List<PermissionSetAssignment>();
            //check if a buyer already
            List<PermissionSetAssignment> checkbuyer = [select id from PermissionSetAssignment where permissionsetid =: info.permBuyerId and assigneeId =: newUser.Id ];
            
            if(checkbuyer.size()<0){
                PermissionSetAssignment buyer = new PermissionSetAssignment (PermissionSetId = info.permBuyerId, AssigneeId = newUser.Id);
                permissionSetList.add(buyer);
            }
                
                PermissionSetAssignment golfStore = new PermissionSetAssignment (PermissionSetId = info.permStoreId, AssigneeId = newUser.Id);
                permissionSetList.add(golfStore);
		
            upsert permissionSetList;
            mess = 'success';
            messBack.add(mess);
        }catch(exception e){
            system.debug(e);
            mess = String.valueOf(e); 
        }
         
        return messBack; 
    }
}