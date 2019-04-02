/* 
    Augument CGM data stream with useful statistics based on recent records
*/


// require modules
const db = require("kvstore");
const pubnub = require('pubnub');

// basic stats functions
let average = (array) => array.reduce((a, b) => a + b) / array.length;

let average_diff = (array, start, end) => {
    var avg = 0;
        var i;
    for (i = start+1; i < end + 1; i++) { 
        
        var diff = array[i] - array[i-1];
        avg += diff;
    }
    return avg/(end-start);
}

// adding some data to drive EON charts
let addEonChartData  = (req) => {
    req.message.eon = {'bg': req.message.sgv, 'trend':  req.message.trend, 'x': req.message.date};

}

// do some basic stats
let addStatsData = (req, last_100_entries_arr) => {
    var last_100_entries_arr_len = last_100_entries_arr.length;
    req.message.average = average(last_100_entries_arr);
    req.message.average_last_5 = average(last_100_entries_arr.slice(last_100_entries_arr_len-6));
    req.message.avg_last_1_diffs = average_diff(last_100_entries_arr, last_100_entries_arr_len-2, last_100_entries_arr_len-1);
    req.message.avg_last_3_diffs = average_diff(last_100_entries_arr, last_100_entries_arr_len-4, last_100_entries_arr_len-1);
    req.message.avg_last_5_diffs = average_diff(last_100_entries_arr, last_100_entries_arr_len-6, last_100_entries_arr_len-1);
    req.message.avg_last_10_diffs = average_diff(last_100_entries_arr, last_100_entries_arr_len-11, last_100_entries_arr_len-1);
}
 
// add locale date time string
let addTimeData = (req) => {
    req.message.localeDateString = new Date(req.message.date).toLocaleString();
}

// main logic
export default (request) => { 

    if (request.message.sgv) { // published message contains entry from loop or other CGM based system
        return db.get("last_100_entries"+request.channels[0]).then((last_100_entries) => {
            var last_100_entries_new = ""; 
            
            if (!last_100_entries) {
                last_100_entries = "";
            }
            
            var last_100_entries_arr = last_100_entries.split(',').map(Number).filter(Boolean);
            
            var last_100_entries_arr_len = last_100_entries_arr.length;
            if (last_100_entries_arr.length > 14) {
                var avg_last_5 = average(last_100_entries_arr.slice(last_100_entries_arr_len-6));
                var avg_last_10 = average(last_100_entries_arr.slice(last_100_entries_arr_len-11));
            }
            if (last_100_entries_arr.length == 100) {
                last_100_entries_arr = last_100_entries_arr.slice(1);
            }
            
            last_100_entries_arr.push(Number(request.message.sgv));
            
            db.set("last_100_entries"+request.channels[0], last_100_entries_arr.join());

            addEonChartData(request);

            addStatsData(request, last_100_entries_arr);
            
            addTimeData(request);
            
            return request.ok(); // Return a promise when you're done         
        })
    } else {
        return request.ok();
    }
}