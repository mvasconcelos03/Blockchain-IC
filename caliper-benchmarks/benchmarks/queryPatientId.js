'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const fs = require("fs");

class QueryPatientIdWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async submitTransaction() {
        let min = 1;
        let max = 10000;
        let id = Math.floor(Math.random() * (max - min + 1)) + min;
        id = id.toString();

        let args = {
            contractId: 'marbles',
            contractVersion: 'v0',
            contractFunction: 'queryPatientById',
            contractArguments: [id],
            timeout: 1000,
            readOnly: true
        };

        let result = await this.sutAdapter.sendRequests(args);
        
        if (result && result.GetTimeFinal && result.GetTimeCreate) {
            let executionTime = result.GetTimeFinal() - result.GetTimeCreate();
            try {
                fs.appendFileSync('./data/EXECUTION_TIME.txt', executionTime + '\n');
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
    }

    async cleanupWorkload() {
        // Lógica de limpeza
    }
}

function createWorkloadModule() {
    return new QueryPatientIdWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;