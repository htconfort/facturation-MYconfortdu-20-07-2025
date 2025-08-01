#!/usr/bin/env node

const https = require('https');

async function testProxy() {
    console.log('🧪 Test du proxy N8N sur Netlify...');
    console.log('=====================================');
    
    const options = {
        hostname: 'willowy-nougat-0a4af3.netlify.app',
        path: '/api/n8n/webhook/facture-universelle',
        method: 'GET'
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`✅ Status: ${res.statusCode}`);
            console.log(`📝 Headers:`, res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📏 Content-Length: ${data.length}`);
                
                if (data.length < 100) {
                    console.log(`📄 Contenu: ${data}`);
                } else if (data.includes('<html>') || data.includes('<!DOCTYPE')) {
                    console.log('❌ PROBLÈME: Le proxy retourne du HTML au lieu de proxifier vers N8N!');
                    console.log('🔧 Solution: Vérifier l\'ordre des règles dans _redirects');
                } else {
                    console.log('✅ Le proxy semble fonctionner correctement');
                }
                
                resolve();
            });
        });
        
        req.on('error', (err) => {
            console.error('❌ Erreur:', err.message);
            reject(err);
        });
        
        req.end();
    });
}

async function testN8NDirect() {
    console.log('\n🎯 Test direct N8N...');
    console.log('======================');
    
    const options = {
        hostname: 'n8n.srv765811.hstgr.cloud',
        path: '/webhook/facture-universelle',
        method: 'GET'
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`✅ Status: ${res.statusCode}`);
            console.log(`📝 Headers:`, res.headers);
            resolve();
        });
        
        req.on('error', (err) => {
            console.error('❌ Erreur:', err.message);
            reject(err);
        });
        
        req.end();
    });
}

async function main() {
    try {
        await testN8NDirect();
        await testProxy();
        
        console.log('\n📋 Résumé:');
        console.log('==========');
        console.log('1. Si N8N direct fonctionne ET proxy retourne du HTML → Problème de configuration _redirects');
        console.log('2. Si N8N direct fonctionne ET proxy fonctionne → Tout va bien!');
        console.log('3. Si N8N direct ne fonctionne pas → Problème côté N8N');
        
    } catch (error) {
        console.error('Erreur lors des tests:', error.message);
    }
}

main();
