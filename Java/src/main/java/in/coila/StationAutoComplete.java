package in.coila;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URL;
import java.util.Properties;
import java.net.HttpURLConnection;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.MalformedURLException;

/**
 * Servlet implementation class TrainStatus
 */
@WebServlet("/stationAutoComplete")
public class StationAutoComplete extends HttpServlet {
	private static final long serialVersionUID = 1L;
	String apikey;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public StationAutoComplete() {
		Properties prop = new Properties();
		InputStream input = null;

		try {
			input = getClass().getClassLoader().getResourceAsStream("config.properties");
			prop.load(input);
			apikey = prop.getProperty("apikey");
		} catch (IOException ex) {
			ex.printStackTrace();
		} finally {
			if (input != null) {
				try {
					input.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		String term = request.getParameter("term");
		PrintWriter out = response.getWriter();
		try {

			URL url = new URL("https://api.railwayapi.com/v2/suggest-station/name/" + term + "/apikey/" + apikey + "/");
			System.out.println(url);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");
			conn.setRequestProperty("Accept", "application/json");
			if (conn.getResponseCode() != 200) {
				throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
			}

			BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream())));

			String output;

			while ((output = br.readLine()) != null) {
				out.println(output);
			}

			conn.disconnect();

		} catch (MalformedURLException e) {

			e.printStackTrace();

		} catch (IOException e) {

			e.printStackTrace();

		}

	}
}
