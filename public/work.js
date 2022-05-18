// const _ = require('underscore');
// const moment = require('moment');

// Problem 1
// const input = [1,2,3,4,5,6,7,8,9];
// const sum = 9;

// const output = [];

// for (let i = 0; i < input.length; i += 1) {
//     for (let j = 0; j < i; j += 1) {
//         if(input[i] + input[j] == sum) {
//             output.push([input[i], input[j]]);
//         }
//     }
// }

// console.log('ouptut isss:\n', output);


// Problem 2
// image file: 
// 1, 2
// 3, 4
// 5, 6
// 7, 8
// 9, 10
// 11, 12
// const noOfDesks = 12;
// const assignedDesks = [2, 6, 7, 11];

// const evenObj = {};
// const oddObj = {};

// for (let i = 1; i <= noOfDesks; i += 1) {
//     if (i % 2 == 0) {
//         evenObj[i] = i;
//     } else {
//         oddObj[i] = i;
//     }
// }

// console.log('evenObj isss', evenObj);
// console.log('oddObj isss', oddObj);


// Problem 3

var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function inWords(num) {
    if ((num = num.toString()).length > 9) {
        return 'overflow';
    }
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) {
        return;
    }
    var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    str = str ? str.charAt(0).toUpperCase() : str;
    return str;
}

console.log(inWords(7));