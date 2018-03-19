/*
 * Copyright (c) 2016 Razeware LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package com.jimgong.isermon;

import android.content.Context;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.InputStream;
import java.util.ArrayList;

public class Sermon {

    String id;
    String title;
    String description;
    String urlLocal;
    String urlSource;
    String username;
    String date;

    static ArrayList<Sermon> getFromResponse(String response){
        ArrayList<Sermon> sermonList = new ArrayList<>();

        try {
            JSONArray sermons = new JSONArray(response);

            // Get Sermon objects from data
            for(int i = 0; i < sermons.length(); i++){
                JSONObject o = sermons.getJSONObject(i);
                Sermon sermon = new Sermon();

                sermon.id = o.getString("_id");
                sermon.title = o.getString("title");
                if (!o.isNull("description")) {
                    sermon.description = o.getString("description");
                }
                if (!o.isNull("urlLocal")) {
                    sermon.urlLocal = o.getString("urlLocal");
                }
                if (!o.isNull("urlSource")) {
                    sermon.urlSource = o.getString("urlSource");
                }
                if (!o.isNull("username")) {
                    sermon.username = o.getString("username");
                }
                if (!o.isNull("date")) {
                    sermon.date = o.getString("date");
                }

                sermonList.add(sermon);
//                Log.d("Sermon", "found sermon: " + sermon.title);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return sermonList;
    }

    //test
    public static ArrayList<Sermon> getRecipesFromFile(String filename){
        final ArrayList<Sermon> sermonList = new ArrayList<>();

        try {
            // Load data
            String jsonString = loadJsonFromAsset(filename);
            JSONObject json = new JSONObject(jsonString);
            JSONArray recipes = json.getJSONArray("recipes");

            // Get Sermon objects from data
            for(int i = 0; i < recipes.length(); i++){
                Sermon sermon = new Sermon();

                sermon.title = recipes.getJSONObject(i).getString("title");
                sermon.description = recipes.getJSONObject(i).getString("description");

                sermonList.add(sermon);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return sermonList;
    }

    //test
    private static String loadJsonFromAsset(String filename) {
        String json = null;

        try {
            Context context = MyApplication.getAppContext();
            InputStream is = context.getAssets().open(filename);
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            json = new String(buffer, "UTF-8");
        }
        catch (java.io.IOException ex) {
            ex.printStackTrace();
            return null;
        }

        return json;
    }

}
