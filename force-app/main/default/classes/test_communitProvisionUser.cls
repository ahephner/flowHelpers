@isTest
public class test_communitProvisionUser {
    @testSetup
    static void setUp(){
        string rid = [select id from recordtype where description like 'Customer Account'].id;
        Account cust = new Account();
        cust.name = 'Golf Course';
        cust.RecordTypeId = rid;
        cust.Customer_Name__c = '123-Golf Course';
       insert cust; 
        
        Contact person = new Contact(); 
        person.lastname = 'Test';
        person.AccountId = cust.Id; 
       insert person; 
    }
	@isTest
    static void findContact(){
        id conId = [select id from contact where lastname = 'Test'].id;
        
        test.startTest();
        	contact con = communityProvisionUser.getContact(conId);
        test.stopTest();
        system.assertNotEquals(null, con); 
    }
    @isTest
    static void testcommunityWrapper(){
        id conId = [select id from contact where lastname = 'Test'].id;
        id proId = [SELECT Id FROM Profile WHERE Name = 'ATS Connect - Customer Community Login User'].id;
        
        communityWrapper x = new communityWrapper();
        	x.fName = 'test';
        	x.lName = 'lname';
        	x.email = 'tl@test.com';
        	x.uName = 'tl@test.com';
        	x.company = 'company';
        	x.phone = '5555555555';
        	x.alias = 'tLname';
        	x.nickname = 'nickname';
        	x.profileId = proId;
        	x.contactId = conId; 
       
        test.startTest();
        	string cu = communityProvisionUser.insertUser(x);
        test.stopTest();
        system.assertEquals('Success', cu); 
        
    }
    
     @isTest
    static void testcreateCampaignUser(){
        id conId = [select id from contact where lastname = 'Test'].id;
        id proId = [SELECT Id FROM Profile WHERE Name = 'ATS Connect - Customer Community Login User'].id;
        list<communityProvisionUser.inputVariables> listUser = new list<communityProvisionUser.inputVariables>(); 
        communityProvisionUser.inputVariables x = new communityProvisionUser.inputVariables();
        
        x.alias = 'tLname';
        x.nickname = 'nickname';
        x.companyName = 'comp';
        x.contactId = conId;
        x.email	= 'tl@test.com';
        x.fName = 'Alex';
        x.lName = 'Hephner';
        x.userName = 'tl@test.com';
        x.profileId = proId;
        x.phone	= '5555555555';
        x.ShopATS = true; 
        x.permBuyerId = '0PS2M000001mkHbWAI';
        x.permStoreId = '0PSVH0000004eq54AA';
        listUser.add(x);
        
         test.startTest();
        	communityProvisionUser.createCampaignUser(listUser);
        test.stopTest();
    }
}