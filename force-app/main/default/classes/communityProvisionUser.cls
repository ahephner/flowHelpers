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
}