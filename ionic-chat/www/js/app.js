// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])
.controller('IonicChatController', IonicChatController)
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

function IonicChatController($ionicPopup, $http, $scope, $ionicActionSheet) {
  var vm = this;
  
  var loggedIn = false;
  
  vm.author = 'Cyborg';
  vm.currentMessage = '';
  vm.messages = [];
  
  vm.sendMessage = function () {
    generalChannel.sendMessage(vm.currentMessage);
    vm.currentMessage = '';
  }
  
  vm.showPopup = function () {
    $ionicPopup.prompt({
      title: 'Welcome!',
      template: 'What is your username?',
      inputType: 'text',
      inputPlaceholder: 'Your username...',
      defaultValue: vm.author
    }).then(function(res) {
      vm.author = res;
      localStorage.setItem('username', res);
      logIn(res);
    });
  }
  
  
  vm.showAction = function() {
    var hide = $ionicActionSheet.show({
      destructiveText: 'Delete Conversation',
      titleText: 'Chat Actions',
      cancelText: 'Cancel',
      cancel: function() {
            // add cancel code..
          },
      destructiveButtonClicked: function () {
        vm.messages = [];
        hide();
      },
      buttonClicked: function(index) {
        console.log('Button chosen: index');
        return true;
      }
    })
  }
  
  var messagingClient;
  var generalChannel;
  
  function logIn(author) {
    if (loggedIn) {
      return;
    }
    console.log('Get token!');
    $http.get('http://localhost:3000/token?device=chat&identity='+author).then(function (res) {
      var accessManager = new Twilio.AccessManager(res.data.token);
      messagingClient = new Twilio.IPMessaging.Client(accessManager);
      
      var promise = messagingClient.getChannelByUniqueName('general');
      promise.then(function(channel) {
          generalChannel = channel;
          if (!generalChannel) {
              // If it doesn't exist, let's create it
              messagingClient.createChannel({
                  uniqueName: 'general',
                  friendlyName: 'General Chat Channel'
              }).then(function(channel) {
                  console.log('Created general channel:');
                  console.log(channel);
                  generalChannel = channel;
                  setupChannel();
              });
          } else {
              console.log('Found channel:');
              console.log(generalChannel);
              setupChannel();
          }
      });
    })
  }
  
  function setupChannel() {
    generalChannel.join().then(function (channel) {
      $scope.$apply(function () {
        vm.messages.push({
          author: 'Chatbot',
          body: 'Joined!'
        });
      })
      
    });
    loggedIn = true;
    
    generalChannel.on('messageAdded', function (message) {
      $scope.$apply(function () {
        vm.messages.push(message);
      })
    });
  }
  
  var user = localStorage.getItem('username');
  if (user && user.length !== 0) {
    vm.author = user;
    logIn(user);
  } else {
    vm.showPopup();
  }
  
}