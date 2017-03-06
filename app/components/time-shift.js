import Ember from 'ember';

const {Component, $, on, observer} = Ember;

export default Component.extend({

  store: Ember.inject.service(),
  plot: null,

  // @Override
  init() {
    this._super(...arguments);

    $(window).resize(() => {
      this.resizePlot();
    });

  },

  // query timestamps from backend and call renderPlot with chart-ready data
  getChartData: function () {

    const store = this.get('store');
    // GET /show-timestamps
    const timestampstorage = store.queryRecord('timestampstorage', '1');

    return timestampstorage.then((timestampstorage) => {
      const timestamps = timestampstorage.get('timestamps');
      const sortedTimestamps = timestamps.sortBy('timestamp');

      // define outside loop in case of error
      var timestampList = [];
      var timestampListFormatted = [];
      var callList = [];

      // Parse and format timestamps for timeline
      if (sortedTimestamps) {
        sortedTimestamps.forEach(function(timestamp) {
          const timestampValue = timestamp.get('timestamp');
          timestampList.push(timestampValue);

          const callValue = timestamp.get('calls');
          callList.push(callValue);

          const parsedTimestampValue = moment(timestampValue,"x");
          const timestampValueFormatted = parsedTimestampValue.format("HH:mm:ss").toString();
          timestampListFormatted.push(timestampValueFormatted);
        });

        //console.log("timestampList[0]",timestampList.objectAt(0));
        //console.log("timestampListFormatted[0]",timestampListFormatted.objectAt(0));
      }

      // maximum number of timestamps displayed in chart at one time
      const maxNumOfChartTimestamps = 30;

      // TODO: error handling (no data etc)

      // Container for charts (limited size)
      var chartTimestamps = [];
      var chartCalls = [];
      const timestampListFormattedSize = timestampListFormatted.length;

      // limit size of displayed data points and labels
      if (timestampListFormattedSize > maxNumOfChartTimestamps) {
        chartTimestamps = timestampListFormatted.slice(timestampListFormattedSize-maxNumOfChartTimestamps,timestampListFormattedSize);
        chartCalls = callList.slice(timestampListFormattedSize-maxNumOfChartTimestamps,timestampListFormattedSize);
      }
      else {
        chartTimestamps = timestampListFormatted;
        chartCalls = callList;
      }

      // get maximum amount of call for scaling the chart
        const maxCalls = Math.max.apply(null, chartCalls);

      const chartData = {
        labels: chartTimestamps,
        values: chartCalls,
        maxValue: maxCalls
      };

      /*
      console.log("timestamp", timestampList.objectAt(0));
      console.log("moment-unix", moment(timestampList.objectAt(0),"x").toString());
      console.log("chartTimestamps", chartData.labels);
      console.log("chartCalls", chartData.values);
      */

      return chartData;

    }).catch(() => {
      console.log('Error loading timestamps!');
    });
  },

  renderPlot: on('didRender', observer('', function () {

    const chartData = this.getChartData();
    chartData.then((chartData) => {

      var winWidth = $(window).width();
      Ember.$("#timeline").css('width', winWidth);

      // Needed to fix the height of the plot
      Ember.$("#timelinePlot").css('width', $("#timeline").width());
      Ember.$("#timelinePlot").css('height', $("#timeline").height());

      var ctx = $("#timelinePlot");


      var config = {
        type: 'line',
        data: {
          //labels: ['15:42:00', '15:42:30', '15:43:00', '15:43:30', '15:44:00'],
          labels: chartData.labels,
          datasets: [{
            label: '# of Calls',
            //data: [0, 2000, 5000, 3000, 1000, 0],
            data: chartData.values,
            backgroundColor: 'rgba(0, 80, 255, 0.2)',
            borderColor: 'rgba(0, 80, 255, 0.8)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          title: {
            display: false,
            text: "# of Calls"
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Time',
                fontStyle: 'bold'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Calls',
                fontStyle: 'bold'
              },
              ticks: {
                beginAtZero: true
              }
            }]
          },

          /*
          TODO
          Panning & Zooming are not working well atm
           */
          /*
          pan: {
            enabled: false,
            // Panning directions. Remove the appropriate direction to disable
            // Eg. 'y' would only allow panning in the y direction
            mode: 'x',
            speed: 10,
            threshold: 10
          },
          */
          /*
          zoom: {
            enabled: true,
            drag: true,
            // Zooming directions. Remove the appropriate direction to disable
            // Eg. 'y' would only allow zooming in the y direction
            mode: 'y',
            limits: {
              max: chartData.maxValue,
              min: 0
            }
          }
          */
        }
      };

      var newPlot = new Chart(ctx, config);
      this.set('plot', newPlot);
      //this.updatePlot();

  }).catch(() => {
    console.log('Error creating chart!');
  });
  })),

  // TODO WIP Update function for plot
  updatePlot: function () {
    //var interval = 1000;
    //Ember.run.later(this, function() {
    var updatedPlot = this.plot;

    const chartData = this.getChartData();
    chartData.then((chartData) => {
          updatedPlot.labels = chartData.labels;
          updatedPlot.data = chartData.values;
          this.set('plot', updatedPlot);
        }).catch(() => {
          console.log('Error updating chart!');
        });

    //}, interval);
  },

  resizePlot: function () {
    this.renderPlot();
  },

  actions: {
    toggleTimeline() {

      if ($(".timeline").attr('vis') === 'show') {
        $(".timeline").slideUp();
        $("#vizContainer").animate({height:'+=200'});
        $(".timeline").attr('vis', 'hide');
      }
      else {
        $(".timeline").slideDown();
        $("#vizContainer").animate({height:'-=200'});
        $(".timeline").attr('vis', 'show');

      }
    }
  }

});