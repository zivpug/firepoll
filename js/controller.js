angular.module('firepollapp').controller('mainCtrl',function($scope, $firebase){


    // firebase
    // Set YOURAPP - to your firebase address
    var ref = new Firebase("https://YOURAPP.firebaseio.com/polls/");
    // Automatically syncs everywhere in realtime
    $scope.polls = $firebase(ref);

    // create basic objects
    $scope.selectedPoll = '';
    $scope.selectedPollOptions = [];
    $scope.load = true;

    /*
    Select a poll from the poll's list
    moveing the poll data to a separate object from the firebase object
    It gives more flexibility with it's construct and data types
    (for example - firebase will return values as string type, while google charts has to have them as numbers
        - note the parseInt on the values)
    It does adds a need to create a watcher for any incoming changes.

    Also, used a separate object for poll voting options ($scope.selectedPollOptions) for some more flexibility
    */

    // Loading poll from the list (in the firebase object)
    $scope.selectPoll = function(id){
        if (id){ // don't run on initial watch
            // hold selected polls id
            $scope.selectedPoll = id;
            // clean poll options object
            $scope.selectedPollOptions = [];
            // clean chart data
            chart1.data = [];
            // populate chart's title from the firebase object
            chart1.options.title = $scope.polls[id].name;
            // google charts require column names in the first dataset row.
            // will give some little pain later
            chart1.data.push(['option','value']);
            // populate chart.data with the values from firebase
            // don't forget to parseInt the values or it will not draw the chart
            for (i=0; i<$scope.polls[id].options.length; i++)
            {
                if ($scope.polls[id].options[i][0] && $scope.polls[id].options[i][1])
                {
                    // if you don't have a numeric value - reset the value
                    var val = parseInt($scope.polls[id].options[i][1]);
                    var option = [$scope.polls[id].options[i][0], val];
                    // push data from the firebase object to the chart data object
                    chart1.data.push(option);
                    // push the options from the firebase object to the poll options object
                    $scope.selectedPollOptions.push($scope.polls[id].options[i]);
                }
            }
            $scope.chart = chart1;
        }
    };

    // deep watch for the firebase object, to have the chart update in real time, when the object updates
    // needed to handle the object separation
    $scope.$watch('polls', function(){
        $scope.selectPoll($scope.selectedPoll);
    },true);


    // data loaded from firebase - angularfire event
    // use to switch the loader off
    $scope.polls.$on("loaded", function() {
           $scope.load = false;
    });



    // vote on poll
    $scope.vote = function(index){
        // calc new total
        // add +1 to index to compensate for first row in chart data not being poll options
        index ++;
        if (angular.isNumber(chart1.data[index][1] ))
        {
            newTotal = parseInt(chart1.data[index][1]) + 1;
        }
        else
        {
            newTotal = 1
        }
        // move index one back
        index--;
        // update value in the firebase object
        $scope.polls[$scope.selectedPoll].options[index][1] = newTotal;
        // save changes to the object and the remote firebase
        $scope.polls.$save();
    };


    // Add "other" option to selected poll
    $scope.addOther = function(){
        if ($scope.vote.optionOther){
            // add new option to the firebase object with 1 vote
            $scope.polls[$scope.selectedPoll].options.push([$scope.vote.optionOther, 1]);
            // save the firebase object - update firebase remote
            $scope.polls.$save();
            // clear the "other" form field
            $scope.vote.optionOther = '';
        }
    };


    //////   google chart basic object
    var chart1 = {};
    chart1.type = "PieChart";
    // chart options. use google chart reference for more info
    // pie chart: https://developers.google.com/chart/interactive/docs/gallery/piechart
    chart1.options = {
        title: '',
        chartArea:{left:30,top:30,width:"300",height:"300"},
        sliceVisibilityThreshold:0,
        displayExactValues: true,
        pieSliceText: 'percentage',
        width: 400,
        height: 300,
        is3D: true,
        slices: {}
    };


    ///  create poll - form methods
    // reset the form
    $scope.resetForm = function(){
        $scope.pollForm = {};
        $scope.pollForm.options = [];
    };
    // call one reset on load for object declaration
    $scope.resetForm();
    // Add a poll option to the creation form
    $scope.addPollOption = function(){
        $scope.pollForm.options.push(['', '0']);
    };
    // remove pull option from the form
    $scope.removeOption = function(index){
        $scope.pollForm.options.splice(index,1);
    };

    // Create a new poll
    $scope.pollCreate = function(){
        // add to poll to the Firebase object - this will update it at the server
        // check for empty options
        for (i=0; i<$scope.pollForm.options.length; i++){
            // make sure no empty options
            if (angular.isUndefined($scope.pollForm.options[i][0]) || $scope.pollForm.options[i][0]=='') {$scope.pollForm.options.splice(i,1)}
        }
        if ($scope.pollForm.name && ($scope.pollForm.options.length>0))
        {
            // add the new form to the firebase object. it will be updated automagically in firebase
            $scope.polls.$add($scope.pollForm);
            // reset the poll creation form
            $scope.resetForm();
        }
    };

});
