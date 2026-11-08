import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRewriteQuery,stripRewriteCapture} from '../api/index.js';

test('Vercel rewrite capture is stripped before the API parses the query',()=>{
 // The capture vercel.json names is removed, leaving no query at all.
 assert.equal(normalizeRewriteQuery('/api/internships?__rewritepath=internships'),'/api/internships');
 assert.equal(normalizeRewriteQuery('/health/ready?__rewritepath=ready'),'/health/ready');
 // Real parameters survive alongside it, in order.
 assert.equal(normalizeRewriteQuery('/api/internships?__rewritepath=internships&page=2'),'/api/internships?page=2');
 assert.equal(normalizeRewriteQuery('/api/internships?page=2&__rewritepath=internships&q=labs'),'/api/internships?page=2&q=labs');
 // Multi-segment captures arrive as repeated parameters.
 assert.equal(normalizeRewriteQuery('/api/internships/5?__rewritepath=internships&__rewritepath=5'),'/api/internships/5');
 // Untouched when there is nothing to strip.
 assert.equal(normalizeRewriteQuery('/api/internships'),'/api/internships');
 assert.equal(normalizeRewriteQuery('/api/internships?q=labs'),'/api/internships?q=labs');
 // Other unexpected parameters are left for the API to reject with 400.
 assert.equal(normalizeRewriteQuery('/api/internships?surprise=1'),'/api/internships?surprise=1');
});

test('the capture is also removed from a pre-parsed query object',()=>{
 // Vercel's Node runtime sets its own req.query, shadowing Express's getter.
 const req={url:'/api/internships?__rewritepath=internships',query:{__rewritepath:'internships'}};
 stripRewriteCapture(req);
 assert.equal(req.url,'/api/internships');
 assert.deepEqual(req.query,{});

 // Genuine parameters are preserved in both places.
 const withParams={url:'/api/internships?__rewritepath=internships&page=2',query:{__rewritepath:'internships',page:'2'}};
 stripRewriteCapture(withParams);
 assert.equal(withParams.url,'/api/internships?page=2');
 assert.deepEqual(withParams.query,{page:'2'});

 // Works when the runtime supplies no query object at all.
 const noQuery={url:'/api/internships?__rewritepath=internships'};
 stripRewriteCapture(noQuery);
 assert.equal(noQuery.url,'/api/internships');

 // A frozen query object must not throw.
 const frozen={url:'/api/internships',query:Object.freeze({__rewritepath:'internships'})};
 assert.doesNotThrow(()=>stripRewriteCapture(frozen));
});
