const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event, context) {
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
    // Dohvatanje podataka iz tabele 'nba_players'
    const { data, error } = await supabase
      .from('nba_players')
      .select('name, team');

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Greška pri dohvatanju NBA igrača:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Neuspešno dohvatanje igrača iz baze.', error: error.message }),
    };
  }
};
