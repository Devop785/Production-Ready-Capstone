import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRewriteQuery} from '../api/index.js';

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
