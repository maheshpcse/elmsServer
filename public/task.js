var users = [
    {
        id: "1",
        name: "Norah"
    },
    {
        id: "2",
        name: "Alyx"
    }
];

var accounts = [
    {
        account: "IRA-4679",
        user: "1",
        balance: "5175.36"
    },
    {
        account: "AAA-3571",
        user: "1",
        balance: "3896342.08"
    },
    {
        account: "AAA-4671",
        user: "1",
        balance: "138971.19"
    },
    {
        account: "ROT-1687",
        user: "2",
        balance: "2686.00"
    },
    {
        account: "AAA-7894",
        user: "2",
        balance: "68761.32"
    },
    {
        account: "IRA-6818",
        user: "2",
        balance: "564.67"
    },
    {
        account: "IRA-6819",
        user: "2",
        balance: "4564.67"
    }
];


// Part 2:
// 1)Answer ****************************************
console.log('Part 2');
function part2_One_Answer() {
    console.log('1)Answer ****************************************');
    const firstArr = [];
    for (const item of accounts) {
        const position = (data) => Number(data.id) === Number(item.user);
        const idNum = users.findIndex(position);
        const strData = `${users[idNum].name} | ${item.account} | ${item.balance}`;
        firstArr.push(strData);
    }
    console.log(firstArr);
    console.log();
    console.log();
    console.log();
}


// 2)
// a)Answer ****************************************
function part2_TwoA_Answer() {
    console.log('2(a)Answer ****************************************');
    const secondArr = [];
    for (const item of users) {
        if (item.name == 'Norah') {
            const filterArr = accounts.filter(ele => (Number(ele.user) === Number(item.id)) && (ele.account.match(/ROT/g) || ele.account.match(/IRA/g) || ele.account.match(/AAA/g)));

            if (filterArr.length > 0) {
                for (const data of filterArr) {
                    const newItem = {
                        id: item.id,
                        name: item.name,
                        account: data.account,
                        balance: data.balance
                    }
                    secondArr.push(newItem);
                }
            }
        }
    }
    console.log(secondArr);
    console.log();
    console.log();
}


// b)Answer ****************************************
function part2_TwoB_Answer() {
    console.log('2(b)Answer ****************************************');
    const accountTypes = {
        'IRA': [],
        'AAA': [],
        'ROT': []
    };
    for (const [key, value] of Object.entries(accountTypes)) {
        var regEx = new RegExp(key, 'g');
        const filterArr = accounts.filter(ele => ele.account.match(regEx));

        if (filterArr.length > 0) {
            filterArr.sort((a, b) => {
                if (Number(a.balance) < Number(b.balance)) {
                    return -1;
                }
            });
            value.push(...filterArr);
        }
    }
    console.log(accountTypes);
    console.log();
    console.log();
}


// c)Answer ****************************************
function part2_TwoC_Answer() {
    console.log('2(c)Answer ****************************************');
    const fourthArr = [];
    for (const item of users) {
        if (item.name == 'Alyx') {
            const filterArr = accounts.filter(ele => (Number(ele.user) === Number(item.id)) && (ele.account.match(/IRA/g)));

            if (filterArr.length > 0) {
                const newArr = [];
                for (const data of filterArr) {
                    const newItem = {
                        id: item.id,
                        name: item.name,
                        account: data.account,
                        balance: data.balance
                    }
                    newArr.push(newItem);
                }
                newArr.sort((a, b) => {
                    if (Number(a.balance) > Number(b.balance)) {
                        return -1;
                    }
                });
                fourthArr.push(...filterArr);
            }
        }
    }
    console.log(fourthArr);
    console.log();
    console.log();
}


// d)Answer ****************************************
function part2_TwoD_Answer() {
    console.log('2(d)Answer ****************************************');
    const fifthArr = {};
    for (const item of users) {
        const filterArr = accounts.filter(ele => Number(ele.user) === Number(item.id));

        if (filterArr.length > 0) {
            fifthArr[item.name] = [];
            const newArr = [];
            for (const data of filterArr) {
                const newItem = {
                    id: item.id,
                    name: item.name,
                    account: data.account,
                    balance: data.balance
                }
                newArr.push(newItem);
            }
            newArr.sort((a, b) => {
                if (Number(a.balance) < Number(b.balance)) {
                    return -1;
                }
            });
            fifthArr[item.name].push(...newArr);
        }
    }
    console.log(fifthArr);
    console.log();
    console.log();
}

part2_One_Answer();
part2_TwoA_Answer();
part2_TwoB_Answer();
part2_TwoC_Answer();
part2_TwoD_Answer();