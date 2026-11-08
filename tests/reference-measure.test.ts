import {test} from 'node:test';
import assert from 'node:assert/strict';
import {referenceEstimate} from '../lib/reference-measure';
const ref=[{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}];
test('reference measurement scales exact planar geometry and stays estimated',()=>{const r=referenceEstimate(ref,[{x:200,y:100},{x:600,y:100},{x:600,y:700},{x:200,y:700}],200,200,true);assert.equal(r.width,800);assert.equal(r.height,1200);assert.equal(r.status,'estimated');assert.equal(r.source,'reference-photo');});
test('same-plane confirmation and a sufficiently visible reference are required',()=>{assert.throws(()=>referenceEstimate(ref,ref,200,200,false));assert.throws(()=>referenceEstimate(ref.map(p=>({x:p.x/10,y:p.y/10})),ref,200,200,true));});
test('crossed corners and implausibly skew openings are rejected',()=>{assert.throws(()=>referenceEstimate([ref[0],ref[2],ref[1],ref[3]],ref,200,200,true));assert.throws(()=>referenceEstimate(ref,[{x:0,y:0},{x:500,y:0},{x:700,y:600},{x:200,y:600}],200,200,true));});
