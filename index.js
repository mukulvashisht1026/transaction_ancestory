
var fs = require('fs');
/*

curl https://blockstream.info/api/

/block-height/:height 


GET 'https://blockstream.info/api/block-height/680000'

GET /block/:hash/txs[/:start_index]
*/


// function used to get block Id from block height
// const getBlockId = async () => {
//     const response = await fetch('https://blockstream.info/api/block-height/680000');

//     const myJson = await response.text();
//     // do something with myJson
//     console.log(myJson.toString());

//     let blockId = myJson.toString(); //000000000000000000076c036ff5119e5a5a74df77abf64203473364509f7732
//   }

//   getBlockId();








  const fetchTransactionInBatch = async () => {
    var index = 0;
    var myJson
    let isError = false;
    let transactions = [];
    while (!isError) {
        const response = await fetch('https://blockstream.info/api//block/000000000000000000076c036ff5119e5a5a74df77abf64203473364509f7732/txs/'+index);
          try {
              myJson = await response.json();
              for (var x in myJson){
                if (index == 0 && x == 0)continue;
                transactions.push(myJson[x]);

               
              }
              
          } catch (e) {
              console.log("not a json : " + index);
              break;
          }
          index += 25;
    }


    findAns(transactions);
  }

  fetchTransactionInBatch();


  const findAns = (transaction) => {
    const transForGraph = [];
    for(let i = 0; i < transaction.length; i++) {
        const t = transaction[i];
        const tid = t.txid;
        const vin = t.vin;

        const input = [];
        const output = [];

        if (vin)
            for (const inp of vin) {
                input.push(inp.txid);
            }
        
        output.push(tid);
        
        transForGraph.push(
            new Trans(tid, input, output)
        )
    }

    solve(transForGraph);
    // solve([
    //     new Trans('xyz', ['abc', 'def'], ['xyz']),
    //     new Trans('mn', ['xyz'], ['mn']),
    //     new Trans('p', ['mn', 'xyz'], ['p'])  
    //       ]);
   


  }

    class Trans {
        constructor(id, input, output) {
            this.id = id;
            this.input = input;
            this.output = output;
        }
    }
    // Considering the built graph does not have *******cycles*******
    const solve = (trans) => {
        const graph = {};
        for (let i = 0; i < trans.length; i++) {
            const t = trans[i];
            const transId = t.id;
            graph[transId] = [];
        }
       
        // which transaction have output as x => transWithOutput
       
        const transWithOutput = {};
        for (let i = 0; i < trans.length; i++) {
            const t = trans[i];
            const transId = t.id;
            const output = t.output;
            for (const o of output) {
                if (!transWithOutput[o]) {
                    transWithOutput[o] = [];
                }
                transWithOutput[o].push(transId);
            }
        }
       
        // console.log(transWithOutput);
       
        // build graph
        for (let i = 0; i < trans.length; i++) {
            const t = trans[i];
            const transId = t.id;
            const input = t.input;
            for (const inp of input) {
                const parent = transWithOutput[inp];
                if (parent) {
                    for (const p of parent) {
                        graph[transId].push(p);
                    }
                }
            }
        }
       
        console.log(graph);
       
        const answer = [];

        for (let node in graph) {
            let ancestor = {};
            rec(node, graph, ancestor);
            let ancestorCount = Object.keys(ancestor).length - 1;
            console.log("ans for ", node, ancestorCount);
            answer.push({node, ancestorCount});
        }

        answer.sort(function(a, b){return b.ancestorCount - a.ancestorCount});

        let take10 = 0;
        for (let ai = 0; take10 < 10 && ai < answer.length; ai++) {
            console.log(answer[ai]);
            take10++;
        }

    }
   
    const rec = (node, graph, ancestor) => {
        ancestor[node] = true;
        // console.log("parent of ", node, graph[node]);
        for (let par of graph[node]) {
            rec(par, graph, ancestor);
        }
    }
   
   

 