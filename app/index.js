const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const P2pServer = require('./p2p-server');

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2pServer(blockchain);

const app = express()
app.use(bodyParser.json());

app.get('/blocks',(req,res)=>{
    res.json(blockchain.chain);
});

app.post('/mine',(req,res)=>{
    const block = blockchain.addBlock(req.body.data);
    console.log(`Block added - ${block.toString()}`);

    p2pServer.syncChain();
    res.redirect('/blocks')
});

app.get('/transactions',(req,res)=>{
    res.json(transactionPool.transactions);
});

app.post('/transact',(req,res)=>{
    const {recipient, amount} = req.body;
    wallet.createTransaction(recipient,amount,transactionPool);
    res.redirect('/transactions');
});

app.listen(HTTP_PORT,() => console.log(`Listening on port: ${HTTP_PORT}`));
p2pServer.listen();