#!/usr/bin/env node
// Copyright (c) 2013 Tom Steele
// See the file license.txt for copying permission

var fs = require('fs');
var xml2js = require('xml2js');

if (!process.argv[2] || !process.argv[3]) {
  console.log('Missing required argument');
  console.log('    ' + process.argv[1] + ' <xml_file> <comma separated list of essids');
  console.log('    Example: ' + process.argv[1] + ' node.netxml is,awesome');
  process.exit(1);
}

var results = [];
var essids = process.argv[3].split(',');
var xml = fs.readFileSync(process.argv[2], {encoding: 'utf8'});
xml2js.parseString(xml, findEssids);

function findEssids(err, result) {
  if (err) {
    console.log('Error processesing xml file');
    process.exit(1);
  }
  var networks = result['detection-run']['wireless-network'];
  if (typeof networks === 'undefined') {
    console.log('No networks found');
    process.exit();
  }
  networks.forEach(function(n) {
    if (typeof n['SSID'] !== 'undefined') {
      var essid = n['SSID'][0]['essid'][0]['_'];
      var bssid = n['BSSID'][0];
      if (essids.indexOf(essid) !== -1) {
        results.push({"essid": essid, "bssid": bssid});
      }
    }
  });
  display();
}

function display() {
  results.sort(function(a, b) {
    return (a.essid < b.essid) ? -1 : (a.essid > b.essid) ? 1 : 0;
  });
  results.forEach(function(r) {
    console.log(r.essid + ',' + r.bssid);
  });
}
