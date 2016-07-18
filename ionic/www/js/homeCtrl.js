angular.module('homeCtrl',[])
//=======Home screen controller======================
.controller('homeCtrl', function($scope,$compile,$timeout,$rootScope,$cordovaSQLite,$ionicPopup,$ionicHistory,$controller,$ionicModal,$http,$ionicLoading,userService,databaseManager,
  dataStoreManager,profileDataManager,$cordovaEmailComposer,pinModalService,eligiblityDataManager,irkResults,
  $base64,$state,$location,$window,syncDataFactory,syncDataService,$q,$cordovaFileTransfer,$cordovaFile,$base64) {

  if(window.Connection) {
            if(navigator.connection.type == Connection.NONE) {
             $ionicLoading.hide();
            }else {
             syncDataFactory.checkDataAvailableToSync().then(function(res){
                  if (res.length > 0 ) {
                     $ionicLoading.show({template: 'Data Sync..'});
                     syncDataFactory.startSyncServiesTouploadData(res).then(function(res){
                     $ionicLoading.hide();
                     },function(error){
                     $ionicLoading.hide();
                     });
                  }
              });
        }
  }

// learn controller parameters
$scope.homeCalss = "icon icon ion-close-round";
$scope.showCloseButton = true ;

     // label for email(ios)/download(android)
      if (ionic.Platform.isAndroid()) {
        $scope.emailOrDownloadConsentLabel  = "Download Consent Document";
      }else{
        $scope.emailOrDownloadConsentLabel  = "Email Consent Document";
      }

databaseManager.checkDatabaseExists().then(function(res){
       if (res == 5 ) {
            //call a method and read from local json and create schema
            userService.getConfigJson().then(function(response){

            var eligibility = JSON.stringify(response.eligibility);
            var profile = JSON.stringify(response.profile);
            var consent_screens = JSON.stringify(response.consent);
            var completeJson = JSON.stringify(response);
            var surveyJson =  response.surveys;
            var tasksJson =  response.tasks;
            var today = new Date() ;

         databaseManager.createAppContentTable(response.version, response.URL,eligibility,profile,consent_screens,completeJson).then(function(resp){
              for (var survey in surveyJson) {
                if (surveyJson.hasOwnProperty(survey)) {
                var obj = surveyJson[survey];
                var date = '';
                var title = survey;
                var id = survey;
                var skippable = '';
                var tasks = '' ;
                 for (var prop in obj) {
                   switch (prop) {
                     case "date": date = obj[prop];
                         break;
                     case "skippable": skippable = JSON.stringify(obj[prop]);
                         break;
                     case "tasks": tasks = JSON.stringify(obj[prop]);
                         break;
                     default:
                   }
                 if (date && title && id && tasks) {
                     var dateArray =date.split(" ");
                     var day = dateArray[2];
                     var month = dateArray[3];
                     databaseManager.createSurveysTable(day,month,title,id,skippable,tasks).then(function(respw){
                      console.log('insert survey '+respw);
                     });
                   }
                 }
               }
             }
          for (var task in tasksJson) {
               if (tasksJson.hasOwnProperty(task)) {
               var timeLimit = tasksJson[task].timelimit ;
               var steps = JSON.stringify(tasksJson[task].steps) ;
               if (timeLimit === undefined || timeLimit === null) {
               timeLimit = '';
               }
               databaseManager.createTasksTable(task,steps,timeLimit).then(function(resp){
               console.log('createTasksTable  '+ resp);
               });
             }
           }
              databaseManager.createSurveyTempTable().then(function(resp){
                  console.log('createSurveyTempTable  '+ resp);
             });

             databaseManager.createSurveyQuestionExpiryTable().then(function(resp){
                  console.log('createSurveyQuestionExpiryTable  '+ resp);
             });

            });

            databaseManager.createSurveyTempTable().then(function(resp){
                console.log('createSurveyTempTable  '+ resp);
            });

            databaseManager.createSurveyQuestionExpiryTable().then(function(resp){
                console.log('createSurveyQuestionTable  '+ resp);
            });

            databaseManager.createSyncServiceTable().then(function(resp){
                console.log('createSynchTable  '+ resp);
              });

            databaseManager.createUserItemMappingTable().then(function(resp){
                  console.log('createUserItemMappingTable  '+ resp);
            });

            databaseManager.createUserResultTable().then(function(resp){
                  console.log('createUserResultTable  '+ resp);
            });

         });
       }
 });

  //openOnlineResource
  $scope.openOnlineResource = function() {
    $ionicModal.fromTemplateUrl('templates/modal-online-resource.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
   });
};


$scope.go = function () {
  $scope.modal.remove();
};

$scope.joinStudy = function () {
  $ionicHistory.clearCache().then(function(){
      $state.transitionTo('eligiblityTest');
  });
};

$scope.GoBack = function () {
  $scope.modal.remove();
};

$scope.sendConsentDoc = function (){
  if (ionic.Platform.isAndroid()) {
    var assetURL = encodeURI("http://voicesurvey.mit.edu/sites/default/files/documents/consent_mobile_20150528.pdf");
    var fileName = "consent_mobile_20150528.pdf";
    var DEV_PATH = cordova.file.externalRootDirectory+"consent_mobile_20150528.pdf";
//  $scope.audioSample = "file://localhost/persistent/path/to/downloads/"+"/consent_mobile_20150528.pdf";

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
  var entry = fileSystem.root+"consent_mobile_20150528.pdf";
  entry.getDirectory("MIT", { // Give your directory name instead of Directory_Name
    create: true,
    exclusive: false
  },onSuccess, onFail);
},null);

// onSuccess function for creating directory
 function onSuccess(parent) {
   dirPath = parent.nativeURL; // It will return location of the folder in device
 }

// onFail function for creating directory
function onFail(error) {
  console.log(error);
}

           var fileTransfer = new FileTransfer();
               fileTransfer.download(assetURL,DEV_PATH,
                   function(entry) {
                       console.log("Success!"+entry.toURL());
                        /*    var fileUri = entry.toURL() ;
                       var localPath = cordova.file.externalRootDirectory;
                       console.log(localPath);
                       $cordovaFile.moveFile(cordova.file.externalDataDirectory, "consent_mobile_20150528.pdf", localPath)
                               .then(function (success) {
                                 console.log(success);
                                 // success
                               }, function (error) {
                                 console.log(error);
                                 // error
                               });
                             */
                     },
                   function(err) {
                       console.log("Error"+err);
                   },true);

  }else {
    var email = {
       attachments: [
         'file://assets/consent_mobile_20150528.pdf'
       ],
       subject: 'Consent doc',
       isHtml: true
    };
    $cordovaEmailComposer.isAvailable().then(function() {
    $cordovaEmailComposer.open(email).then(null, function () {
      console.log('email ');
    });
  }, function () {
    // not available
    console.log('email not available' );
  });
 }
}

//==================================Select email view ==========
     $scope.openSignInChooseEmail = function() {
      $scope.transition('signIn');
  };

  /*
  //get IP like email ids
   profileDataManager.getEmailList().then(function(response){
     var griderArray = new Array() ;
     for (var i = 0; i < response.length; i++) {
       griderArray.push({'emailId':response.item(i).emailId});
     }
     $scope.emails = griderArray;
  });

  $ionicModal.fromTemplateUrl('templates/signin-choose-email.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.modal.show();
    $scope.setPasscodeFocus = true ;
    $scope.hidePasscodeDiv = true ;
    $scope.hideImageDiv = false ;
  });

  */

//from Sign in screen to  eligiblityTest
  $scope.showEligibilityTestView = function() {
     $scope.modal.remove();
     $ionicHistory.clearCache().then(function(){
     $state.transitionTo('eligiblityTest');
   });
};

//error handler dailog
$scope.callAlertDailog =  function (message){
        $ionicPopup.alert({
         title: 'Error',
         template: message
        });
  };

//on done clear states and travel to next screen
$scope.transition =  function (state){
     $ionicHistory.clearCache().then(function(){
     $state.transitionTo(state);
     });
  };

});
