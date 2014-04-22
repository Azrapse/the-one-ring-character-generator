'use strict';

/* Controllers */

var torApp = angular.module('torApp', []);

torApp.controller('CharacterController', function ($scope, $http) {
    $scope.characters = [
    { 'name': 'Guillermo', 'culture': 'beorning' },
    { 'name': 'Nileth', 'culture': 'elf' },
    { 'name': 'Pelo', 'culture': 'woodman' },
    { 'name': 'Orothñogol', 'culture': 'elf' }
  ];
});