// Download official BAC PDFs from officedubac.sn and upload to Supabase
// Run: node download-concours.js

const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const http = require('http')

const SUPABASE_URL = 'https://hniulgmschxymcfgyaiz.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY // Pass via env

if (!SUPABASE_KEY) {
  console.log('Usage: SUPABASE_KEY=your_anon_key node download-concours.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// PDF sources from officedubac.sn (official government site)
const PDFS = [
  // ===== BAC 2024 =====
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/Maths-S2-1ER-REMPL-24.pdf', school: 'BAC-S2', year: 2024, type: 'epreuve', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/Maths-S1-S3-1-ER-GR.pdf', school: 'BAC-S1', year: 2024, type: 'epreuve', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/SCI-PHY-S2-1er-gr-R-2024.pdf', school: 'BAC-S2', year: 2024, type: 'epreuve', subject: 'Physique-Chimie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/scien-ph-s1-s3-1er-gr-R-2024.pdf', school: 'BAC-S1', year: 2024, type: 'epreuve', subject: 'Physique' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/SVT-S1-1ER-GR-REMPL-24.pdf', school: 'BAC-S1', year: 2024, type: 'epreuve', subject: 'SVT' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/SVT-S2-1ER-REMPL-24.pdf', school: 'BAC-S2', year: 2024, type: 'epreuve', subject: 'SVT' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/francais-s-rempl-1er-gr-24.pdf', school: 'BAC-S2', year: 2024, type: 'epreuve', subject: 'Francais' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/francais-L-1er-gr-rempl-2024.pdf', school: 'BAC-L1', year: 2024, type: 'epreuve', subject: 'Francais' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/PHILO-S-REMPL-1ER-24.pdf', school: 'BAC-S2', year: 2024, type: 'epreuve', subject: 'Philosophie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/philo-L-1er-gr-R-2024.pdf', school: 'BAC-L1', year: 2024, type: 'epreuve', subject: 'Philosophie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/H-G-REMPL-1er-gr-2024.pdf', school: 'BAC-L1', year: 2024, type: 'epreuve', subject: 'Histoire-Geographie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/ANGLAIS-S-REMPL-1ER-GR-24.pdf', school: 'BAC-S2', year: 2024, type: 'epreuve', subject: 'Anglais' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/Maths-l-1er-gr-rempl-24.pdf', school: 'BAC-L1', year: 2024, type: 'epreuve', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/maths-steg-rempl-1er-gr-2024.pdf', school: 'BAC-G', year: 2024, type: 'epreuve', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/Philo-STEG-1er-gr-2024.pdf', school: 'BAC-G', year: 2024, type: 'epreuve', subject: 'Philosophie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/SCIENCES-PHYSIQUES-L2-REMPL-1ER-GR-24.pdf', school: 'BAC-L2', year: 2024, type: 'epreuve', subject: 'Sciences-Physiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/10/SVT-L2-REMPL-1ER-GR-24.pdf', school: 'BAC-L2', year: 2024, type: 'epreuve', subject: 'SVT' },

  // ===== BAC 2024 CORRIGES =====
  { url: 'https://officedubac.sn/wp-content/uploads/2024/07/Corrige_MATHS-S2.pdf', school: 'BAC-S2', year: 2024, type: 'corrige', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/07/MATHS-S2S4S5.pdf', school: 'BAC-S2', year: 2024, type: 'epreuve', subject: 'Maths-1er-groupe' },
  { url: 'https://officedubac.sn/wp-content/uploads/2024/07/Grille-HG-Bac-2024.pdf', school: 'BAC-L1', year: 2024, type: 'corrige', subject: 'Histoire-Geographie' },

  // ===== BAC 2023 EPREUVES =====
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/EPREUVE-MATH-S1S3.pdf', school: 'BAC-S1', year: 2023, type: 'epreuve', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/francais-s-1er-gr-2023.pdf', school: 'BAC-S2', year: 2023, type: 'epreuve', subject: 'Francais' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/FRANCAIS-L.pdf', school: 'BAC-L1', year: 2023, type: 'epreuve', subject: 'Francais' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/FRANCAIS-LA.pdf', school: 'BAC-L2', year: 2023, type: 'epreuve', subject: 'Francais' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/maths-L-1ER-GR-2023.pdf', school: 'BAC-L1', year: 2023, type: 'epreuve', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/SVT-S1S1A.pdf', school: 'BAC-S1', year: 2023, type: 'epreuve', subject: 'SVT' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/SVT-S2S2A.pdf', school: 'BAC-S2', year: 2023, type: 'epreuve', subject: 'SVT' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/SUJET-HG-2023.pdf', school: 'BAC-L1', year: 2023, type: 'epreuve', subject: 'Histoire-Geographie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/ECONOMIE-L2.pdf', school: 'BAC-L2', year: 2023, type: 'epreuve', subject: 'Economie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/03/EPREUVE-Maths-STEG-1ER-GR-2023.pdf', school: 'BAC-G', year: 2023, type: 'epreuve', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/03/Philo-STEG-STIDD-GP1-2023.pdf', school: 'BAC-G', year: 2023, type: 'epreuve', subject: 'Philosophie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/03/Economie-SETG-GP1-2023.pdf', school: 'BAC-G', year: 2023, type: 'epreuve', subject: 'Economie' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/03/EPREUVE-Informatique-STEG-1ER-GR-2023.pdf', school: 'BAC-G', year: 2023, type: 'epreuve', subject: 'Informatique' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/03/EPREUVE-DE-GESTION-COMTP-1-ER-GR-2023.pdf', school: 'BAC-G', year: 2023, type: 'epreuve', subject: 'Comptabilite-Gestion' },

  // ===== BAC 2023 CORRIGES =====
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/Corrige_MATHS-S1S3-G1.pdf', school: 'BAC-S1', year: 2023, type: 'corrige', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/Epreuve-et-Corrige-MATHS-S2-2023.pdf', school: 'BAC-S2', year: 2023, type: 'corrige', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/corrige-maths-l-ar-1er-gr-23.pdf', school: 'BAC-L2', year: 2023, type: 'corrige', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/CORRIGE-SVT-S1-1ER-GR-2023.pdf', school: 'BAC-S1', year: 2023, type: 'corrige', subject: 'SVT' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/02/CORRIGE-SVT-S2-1ER-2023.pdf', school: 'BAC-S2', year: 2023, type: 'corrige', subject: 'SVT' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/03/Corrige_STEG1-Maths-GP1-2023.pdf', school: 'BAC-G', year: 2023, type: 'corrige', subject: 'Mathematiques' },
  { url: 'https://officedubac.sn/wp-content/uploads/2025/03/CORRIGE-GESTION-COMTP-1-ER-GR-2023.pdf', school: 'BAC-G', year: 2023, type: 'corrige', subject: 'Comptabilite-Gestion' },
]

function fetchPDF(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPDF(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function main() {
  console.log(`\nDownloading and uploading ${PDFS.length} PDFs...\n`)

  let success = 0, failed = 0

  for (const pdf of PDFS) {
    const fileName = `${pdf.school}_${pdf.year}_${pdf.type}_${pdf.subject.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
    const storagePath = `${pdf.school}/${fileName}`

    process.stdout.write(`  ${pdf.school} ${pdf.year} ${pdf.type} ${pdf.subject}... `)

    try {
      // Download
      const buffer = await fetchPDF(pdf.url)
      if (buffer.length < 1000) throw new Error('File too small')

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('concours')
        .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true })

      if (uploadErr) throw uploadErr

      // Upsert DB entry
      const { data: existing } = await supabase
        .from('concours_papers')
        .select('id')
        .eq('school_code', pdf.school)
        .eq('year', pdf.year)
        .eq('paper_type', pdf.type)
        .single()

      if (existing) {
        await supabase.from('concours_papers')
          .update({ file_url: storagePath, description: pdf.subject })
          .eq('id', existing.id)
      } else {
        await supabase.from('concours_papers')
          .insert({ school_code: pdf.school, year: pdf.year, paper_type: pdf.type, file_url: storagePath, description: pdf.subject })
      }

      console.log(`OK (${(buffer.length / 1024).toFixed(0)} KB)`)
      success++
    } catch (err) {
      console.log(`FAIL: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone! ${success} uploaded, ${failed} failed\n`)
  process.exit(0)
}

main()
