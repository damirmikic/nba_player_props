const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Supabase URL ili ključ nisu podešeni." }),
    };
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { playerName, teamName } = JSON.parse(event.body);

    if (!playerName || !teamName) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Ime igrača i tima su obavezni.' }) };
    }

    // Upis/ažuriranje u 'nba_players' tabelu
    const { data, error } = await supabase
      .from('nba_players')
      .upsert({ name: playerName, team: teamName }, { onConflict: 'name' })
      .select();

    if (error) {
      console.error('Supabase greška prilikom UPSERT-a:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Supabase greška: Nije moguće upisati ili ažurirati igrača.',
          details: error.message
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Igrač je uspešno sačuvan u bazi.',
        returnData: data 
      }),
    };
  } catch (error) {
    console.error('Greška u izvršavanju funkcije:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Greška na serveru.', error: error.message }),
    };
  }
};
