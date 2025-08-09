/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * Medical data management chaincode written in node.js, implementing {@link Contract}.
 */
class MedicalDataContract extends Contract {
    /**
     * Initialize the chaincode
     * @param {Context} ctx The transaction context
     */
    async initLedger(ctx) {
        console.info('=========== Instantiated Medical Data Chaincode ===========');
    }

    /**
     * Creates a new patient with the given attributes.
     * @param {Context} ctx The transaction context
     * @param {String} rowId Row ID
     * @param {String} subjectId Subject ID
     * @param {String} gender Gender
     * @param {String} dob Date of birth
     * @param {String} dod Date of death
     * @param {String} dodHosp DOD hospital
     * @param {String} dodSsn DOD SSN
     * @param {String} expireFlag Expire flag
     */
    async insertPatient(ctx, rowId, subjectId, gender, dob, dod, dodHosp, dodSsn, expireFlag) {
        console.log('--- start init patient ---');
        
        if (!rowId || !subjectId || !gender || !dob) {
            throw new Error('Required arguments are missing');
        }

        const input = {
            docType: 'patients',
            rowId: rowId,
            subjectId: subjectId,
            gender: gender,
            dob: dob,
            dod: dod || '',
            dodHosp: dodHosp || '',
            dodSsn: dodSsn || '',
            expireFlag: parseInt(expireFlag) || 0
        };

        // Save to state
        await ctx.stub.putState(subjectId, Buffer.from(JSON.stringify(input)));
        console.info('- end init patient');

        return JSON.stringify(input);
    }

    /**
     * Queries for patient based on a passed id.
     * @param {Context} ctx The transaction context
     * @param {String} subjectId The patient subject ID
     * @return {String} The patient data
     */
    async queryPatientById(ctx, subjectId) {
        if (!subjectId) {
            throw new Error('Subject ID is required');
        }

        const patientAsBytes = await ctx.stub.getState(subjectId);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`Patient ${subjectId} does not exist`);
        }
        return patientAsBytes.toString();
    }

    /**
     * Queries for all patients.
     * @param {Context} ctx The transaction context
     * @return {String} All patients
     */
    async queryAllPatients(ctx) {
        const queryString = {
            selector: {
                docType: 'patients'
            }
        };

        const resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this.getAllResults(resultsIterator, false);
        return JSON.stringify(results);
    }

    /**
     * Gets the results of a specified iterator.
     * @param {Object} iterator The iterator to use.
     * @param {Boolean} isHistory Specifies whether the iterator returns history entries or not.
     * @return {Array} The array of results.
     */
    async getAllResults(iterator, isHistory) {
        let allResults = [];
        let result = await iterator.next();
        while (!result.done) {
            let jsonRes = {};
            if (result.value && result.value.value.toString()) {
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = result.value.txId;
                    jsonRes.Timestamp = result.value.timestamp;
                    jsonRes.IsDelete = result.value.isDelete.toString();
                    try {
                        jsonRes.Value = JSON.parse(result.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = result.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = result.value.key;
                    try {
                        jsonRes.Record = JSON.parse(result.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = result.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            result = await iterator.next();
        }
        return allResults;
    }
}

module.exports = MedicalDataContract;