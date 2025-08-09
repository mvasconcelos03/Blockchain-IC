'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const fs = require("fs");

class QueryPatientIdWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.bc = null;
        this.contx = null;
    }

    async initializeWorkload(context, roundIndex, roundArguments) {
        this.bc = context.engine.getBlockchain();
        this.contx = context;
        console.log(`Starting Round ${roundIndex}: ${this.info}`);
    }

    async submitTransaction() {
        let min = 1;
        let max = 10000;
        let id = Math.floor(Math.random() * (max - min + 1)) + min;
        id = id.toString();

        let args;
        if (this.bc.getType() === 'fabric') {
            args = {
                chaincodeFunction: 'queryPatientById',
                chaincodeArguments: [id]
            };
        }

        let results = await this.bc.querySmartContract(this.contx, 'testecouch', 'v0', args, 1000);

        for (let result of results) {
            let executionTime = result.GetTimeFinal() - result.GetTimeCreate();
            try {
                fs.appendFileSync('path/to/file/EXECUTION_TIME', executionTime + '\n');
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
        return results;
    }

    async cleanupWorkload() {
        // Lógica de limpeza
    }
}

function createWorkloadModule() {
    return new QueryPatientIdWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;