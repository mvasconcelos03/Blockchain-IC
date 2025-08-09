'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const fs = require("fs");

class InsertPrescriptionWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.position = 240;
    }

    async submitTransaction() {
        const fd = fs.openSync("./data/PRESCRIPTIONS.csv", 'r');
        let line = "";
        const charBuffer = Buffer.alloc(1);

        while (charBuffer.toString() !== '\n') {
            fs.readSync(fd, charBuffer, 0, 1, this.position);
            this.position++;
            line += charBuffer.toString();
        }

        if (charBuffer.toString() === '\n') {
            line = line.replace(/\r?\n/g, "");
            let entries = line.split(",");

            let args = {
                contractId: 'marbles',
                contractVersion: 'v0',
                contractFunction: 'insertPrescription',
                contractArguments: [
                    entries[0], entries[1], entries[2], entries[3], entries[4], entries[5],
                    entries[6], entries[7], entries[8], entries[9], entries[10], entries[11],
                    entries[12], entries[13], entries[14], entries[15], entries[16],
                    entries[17], entries[18]
                ],
                timeout: 4000
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

        fs.closeSync(fd);
    }

    async cleanupWorkload() {
        // Lógica de limpeza
    }
}

function createWorkloadModule() {
    return new InsertPrescriptionWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;