import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRewriteQuery} from '../api/index.js';

test('Vercel rewrite artifact is stripped without weakening query validation',()=>{
 // The injected capture is removed so the records API sees no query at all.
 assert.equal(normalizeRewriteQuery('/api/internships?path=internships'),'/api/internships');
 assert.equal(normalizeRewriteQuery('/health/ready?path=ready'),'/health/ready');
 // Real parameters survive alongside the injected one.
 assert.equal(normalizeRewriteQuery('/api/internships?path=internships&page=2'),'/api/internships?page=2');
 assert.equal(normalizeRewriteQuery('/api/internships?page=2&path=internships&q=labs'),'/api/internships?page=2&q=labs');
 // Multi-segment captures arrive as repeated parameters.
 assert.equal(normalizeRewriteQuery('/api/internships/5?path=internships&path=5'),'/api/internships/5');
 // A client-supplied path that does not match the route is still passed through
 // so the allowlist rejects it with 400.
 assert.equal(normalizeRewriteQuery('/api/internships?path=evil'),'/api/internships?path=evil');
 // Untouched when there is nothing to strip.
 assert.equal(normalizeRewriteQuery('/api/internships'),'/api/internships');
 assert.equal(normalizeRewriteQuery('/api/internships?q=labs'),'/api/internships?q=labs');
});
