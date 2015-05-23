/**
 *
 *  .CITY Starter Kit
 *  Copyright 2015 WoT.City Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

/**
 * Modules
 */

var $ = require('jquery');
window.$ = $;
window.jQuery = $;
var _ = require('underscore');
var Backbone = require('backbone');
var Automation = require('automationjs');
var d3 = require('d3');
var loadLiquidFillGauge = require('./liquidFillGauge').loadLiquidFillGauge;
var liquidFillGaugeDefaultSettings = require('./liquidFillGauge').liquidFillGaugeDefaultSettings;

/**
 * Setup
 */

Backbone.$ = window.$;
var app = app || {};

/**
 * MODELS
 **/

app.Container = Backbone.Model.extend({
  url: function() {
    return '/';
  },
  wsUrl: function() {
    return 'ws://wot.city/object/' + this.attributes.name + '/viewer';
  },
  defaults: {
    name: 'test',
    data: '',
    cid: 0,
    temp: 0
  },
  // AutomationJS plugins
  parseJSON: function() {
    // remove internal properties from model
    var objCopy = function(object) {
      var o = {};
      for (var p in object) {
        if (object.hasOwnProperty(p)) {
          // AutomationJS:
          // don't copy internal properties
          if (p === 'name' || p === 'data' || p === 'cid') {
              continue;
          }
          o[p] = object[p];
        }
      }
      return o;
    };

    var o = objCopy(this.attributes);

    this.set('data', JSON.stringify(o));
    this.trigger('sync');
  },
  // Y-Axis getter
  getY: function() {
    return this.get('temperature');
  }
});

/**
 * VIEWS
 **/

app.ContainerView = Backbone.View.extend({
  el: '#gauge',
  template: _.template( $('#tmpl-gauge').html() ),
  initialize: function() {
    this.component = new Automation({
      el: this.$el,
      model: app.Container,
      template: this.template
    });
    this.d3Init();
  },
  d3Init: function() {
    this.gaugeConfigs();
  },
  gaugeConfigs: function() {
    this.config1 = liquidFillGaugeDefaultSettings();
    this.config1.circleColor = "#FF7777";
    this.config1.textColor = "#FF4444";
    this.config1.waveTextColor = "#FFAAAA";
    this.config1.waveColor = "#FFDDDD";
    this.config1.circleThickness = 0.2;
    this.config1.textVertPosition = 0.2;
    this.config1.waveAnimateTime = 1000;

    this.config2 = liquidFillGaugeDefaultSettings();
    this.config2.circleColor = "#D4AB6A";
    this.config2.textColor = "#553300";
    this.config2.waveTextColor = "#805615";
    this.config2.waveColor = "#AA7D39";
    this.config2.circleThickness = 0.1;
    this.config2.circleFillGap = 0.2;
    this.config2.textVertPosition = 0.8;
    this.config2.waveAnimateTime = 2000;
    this.config2.waveHeight = 0.3;
    this.config2.waveCount = 1;
    
    this.config3 = liquidFillGaugeDefaultSettings();
    this.config3.textVertPosition = 0.8;
    this.config3.waveAnimateTime = 5000;
    this.config3.waveHeight = 0.15;
    this.config3.waveAnimate = false;
    this.config3.waveOffset = 0.25;
    this.config3.valueCountUp = false;
    this.config3.displayPercent = false;
    
    this.config4 = liquidFillGaugeDefaultSettings();
    this.config4.circleThickness = 0.15;
    this.config4.circleColor = "#808015";
    this.config4.textColor = "#555500";
    this.config4.waveTextColor = "#FFFFAA";
    this.config4.waveColor = "#AAAA39";
    this.config4.textVertPosition = 0.8;
    this.config4.waveAnimateTime = 1000;
    this.config4.waveHeight = 0.05;
    this.config4.waveAnimate = true;
    this.config4.waveRise = false;
    this.config4.waveOffset = 0.25;
    this.config4.textSize = 0.75;
    this.config4.waveCount = 3;
    
    this.config5 = liquidFillGaugeDefaultSettings();
    this.config5.circleThickness = 0.4;
    this.config5.circleColor = "#6DA398";
    this.config5.textColor = "#0E5144";
    this.config5.waveTextColor = "#6DA398";
    this.config5.waveColor = "#246D5F";
    this.config5.textVertPosition = 0.52;
    this.config5.waveAnimateTime = 5000;
    this.config5.waveHeight = 0;
    this.config5.waveAnimate = false;
    this.config5.waveCount = 2;
    this.config5.waveOffset = 0.25;
    this.config5.textSize = 1.2;
    this.config5.minValue = 30;
    this.config5.maxValue = 150
    this.config5.displayPercent = false;
  },
  render: function(name) {
    this.model = this.component.add({
        name: name
    });
    this.listenTo(this.model, 'sync', this.update);
  },
  syncUp: function(name) {
    this.render(name);
  },
  update: function() {
    var y = this.model.getY();

    this.$el.find('#fillgauge').empty();

    if (y < 30) {
      loadLiquidFillGauge("fillgauge", y, this.config1);
    } else if (y >= 30 && y < 50) {
      loadLiquidFillGauge("fillgauge", y, this.config2);
    } else if (y >= 50 && y < 90) {
      loadLiquidFillGauge("fillgauge", y /*, this.config3 */);
    } else if (y >= 90 && y <= 100) {
      loadLiquidFillGauge("fillgauge", y, this.config4);
    } else {
      loadLiquidFillGauge("fillgauge", y, this.config5);
    }
  }
});

/*
 * ROUTES
 */

app.AppRoutes = Backbone.Router.extend({
  routes: {
    ':name': 'appByName'
  },
  appByName: function(name) {
    app.containerView = new app.ContainerView();
    app.containerView.syncUp(name);
  }
});

/**
 * BOOTUP
 **/

$(function() {
  app.appRoutes = new app.AppRoutes();
  Backbone.history.start();
});
