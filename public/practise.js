const _ = require('underscore');
const moment = require('moment');
var feed = require('./feed.js');

// new task 0
// input data
// const inputArr = [
//     {
//         "vendor": "valuefirst",
//         "missionCode": "HRV",
//         "countryCode": "IND",
//         "sourceApp": "OFFLINE-V2",
//         "vacCode": "DEL",
//         "language": "English",
//         "msgCount": 1,
//         "sent": "2022-02-10",
//         "msgRequests": 331,
//         "mcs": "HRV-IND (OFFLINE-V2)",
//         "locale": "uc",
//         "msgCountStr": "1 message",
//         "countedMessages": 331
//     },
//     {
//         "vendor": "valuefirst",
//         "missionCode": "POL",
//         "countryCode": "IND",
//         "sourceApp": "OFFLINE-V1",
//         "vacCode": "PLND",
//         "language": "English",
//         "msgCount": 3,
//         "sent": "2022-02-10",
//         "msgRequests": 17,
//         "mcs": "POL-IND (OFFLINE-V1)",
//         "locale": "uc",
//         "msgCountStr": "3 message",
//         "countedMessages": 51
//     },
//     {
//         "vendor": "karix",
//         "missionCode": "DNK",
//         "countryCode": "GBR",
//         "sourceApp": "OFFLINE-V1",
//         "vacCode": "EDIN",
//         "language": "English",
//         "msgCount": 2,
//         "sent": "2022-02-10",
//         "msgRequests": 4,
//         "mcs": "DNK-GBR (OFFLINE-V1)",
//         "locale": "uc",
//         "msgCountStr": "2 message",
//         "countedMessages": 8,
//     },
//     {
//         "vendor": "karix",
//         "missionCode": "LTU",
//         "countryCode": "AZE",
//         "sourceApp": "OFFLINE-V2",
//         "vacCode": "BAK",
//         "language": "English",
//         "msgCount": 1,
//         "sent": "2022-02-10",
//         "msgRequests": 11,
//         "mcs": "LTU-AZE (OFFLINE-V2)",
//         "locale": "uc",
//         "msgCountStr": "1 message",
//         "countedMessages": 11
//     },
//     {
//         "vendor": "valuefirst",
//         "missionCode": "DNK",
//         "countryCode": "IND",
//         "sourceApp": "OFFLINE-V1",
//         "vacCode": "DEBR",
//         "language": "English",
//         "msgCount": 2,
//         "sent": "2022-02-10",
//         "msgRequests": 3,
//         "mcs": "DNK-IND (OFFLINE-V1)",
//         "locale": "uc",
//         "msgCountStr": "2 message",
//         "countedMessages": 6
//     },
//     {
//         "vendor": "karix",
//         "missionCode": "NOR",
//         "countryCode": "ARE",
//         "sourceApp": "OFFLINE-V2",
//         "vacCode": "AUH",
//         "language": "English",
//         "msgCount": 1,
//         "sent": "2022-02-10",
//         "msgRequests": 1,
//         "mcs": "NOR-ARE (OFFLINE-V2)",
//         "locale": "uc",
//         "msgCountStr": "1 message",
//         "countedMessages": 1
//     },
//     {
//         "vendor": "karix",
//         "missionCode": "NLD",
//         "countryCode": "ARE",
//         "sourceApp": "OFFLINE-V2",
//         "vacCode": "DXB",
//         "language": "English",
//         "msgCount": 2,
//         "sent": "2022-02-10",
//         "msgRequests": 46,
//         "mcs": "NLD-ARE (OFFLINE-V2)",
//         "locale": "uc",
//         "msgCountStr": "2 message",
//         "countedMessages": 92
//     },
//     {
//         "vendor": "karix",
//         "missionCode": "IND",
//         "countryCode": "NLD",
//         "sourceApp": "OFFLINE-V1",
//         "vacCode": "ACNA",
//         "language": "English",
//         "msgCount": 1,
//         "sent": "2022-02-10",
//         "msgRequests": 5,
//         "mcs": "CAN-IND (OFFLINE-V1-IRCC)",
//         "locale": "uc",
//         "msgCountStr": "1 message",
//         "countedMessages": 5
//     },
//     {
//         "vendor": "optimummeasures",
//         "missionCode": "CAN",
//         "countryCode": "NGA",
//         "sourceApp": "ONLINE-GA-SMS",
//         "vacCode": "LOS",
//         "language": "English",
//         "msgCount": 1,
//         "sent": "2022-02-10",
//         "msgRequests": 194,
//         "mcs": "CAN-IND (OFFLINE-V1-IRCC)",
//         "locale": "uc",
//         "msgCountStr": "1 message",
//         "countedMessages": 194
//     },
//     {
//         "vendor": "valuefirst",
//         "missionCode": "CAN",
//         "countryCode": "IND",
//         "sourceApp": "OFFLINE-V1-IRCC",
//         "vacCode": "INBL",
//         "language": "English",
//         "msgCount": 1,
//         "sent": "2022-02-10",
//         "msgRequests": 319,
//         "mcs": "CAN-IND (OFFLINE-V1-IRCC)",
//         "locale": "uc",
//         "msgCountStr": "1 message",
//         "countedMessages": 319
//     }
// ];

// logic
// const groupByInputArr = _.groupBy(inputArr, 'mcs');
// const outputArr = [];

// for (const item of Object.keys(groupByInputArr)) {
//     const newItem = {};
//     newItem['mcs'] = item;
//     const groupByMessageCountStr = _.groupBy(groupByInputArr[item], 'msgCountStr');
//     for (const data of Object.keys(groupByMessageCountStr)) {
//         const keyName = `${data}-countedMessages`;
//         const keyName1 = `${data}-msgRequests`;
//         newItem[keyName] = _.reduceRight(groupByMessageCountStr[data], (a, b) => {
//             return Number(a) + Number(b.countedMessages);
//         }, 0);
//         newItem[keyName1] = _.reduceRight(groupByMessageCountStr[data], (a, b) => {
//             return Number(a) + Number(b.msgRequests);
//         }, 0);
//     }
//     outputArr.push(newItem);
// }

// output data
// console.log('Final output data isss', outputArr);
// console.table(outputArr);
// end new task 0


// new task 1
// const employeeData = [
//     {
//         emp_id: '1103',
//         leave_start_date: '2022-02-17',
//         leave_end_date: '2022-02-18',
//         addedDays: ['2022-02-17', '2022-02-18', '2022-02-22', '2022-02-22', '2022-02-26', '2022-02-27'],
//         work_start_date: null,
//         work_end_date: null,
//     },
//     {
//         emp_id: '1103',
//         leave_start_date: '2022-02-22',
//         leave_end_date: '2022-02-22',
//         addedDays: ['2022-02-17', '2022-02-18', '2022-02-22', '2022-02-22', '2022-02-26', '2022-02-27'],
//         work_start_date: null,
//         work_end_date: null,
//     },
//     {
//         emp_id: '1103',
//         leave_start_date: '2022-02-26',
//         leave_end_date: '2022-02-27',
//         addedDays: ['2022-02-17', '2022-02-18', '2022-02-22', '2022-02-22', '2022-02-26', '2022-02-27'],
//         work_start_date: null,
//         work_end_date: null,
//     }
// ];
// const addedDays = _.uniq(employeeData[2].addedDays);
// const startDate = employeeData[2].leave_start_date;
// const endDate = employeeData[2].leave_end_date;

// const copyAddedDays = [];
// for (const item of addedDays) {
//     if (item <= startDate) {
//         copyAddedDays.push(item);
//     }
// }
// console.log('copyAddedDays isss', copyAddedDays);

// let tempStartDate = null
// let tempEndDate = null

// if (copyAddedDays.length && copyAddedDays[copyAddedDays.length - 2]) {
//     tempStartDate = moment(copyAddedDays[copyAddedDays.length - 2]).add(1, 'days').format('YYYY-MM-DD');
// } else {
//     tempStartDate = moment(startDate).format('YYYY-MM-01');
// }
// if (copyAddedDays.length && copyAddedDays[copyAddedDays.length - 1]) {
//     tempEndDate = moment(copyAddedDays[copyAddedDays.length - 1]).subtract(1, 'days').format('YYYY-MM-DD');
// }
// console.log('tempStartDate isss', tempStartDate);
// console.log('tempEndDate isss', tempEndDate);
// end new task 1