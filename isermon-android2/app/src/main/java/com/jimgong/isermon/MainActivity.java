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

import android.app.DownloadManager;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.widget.ListView;

import com.squareup.picasso.Downloader;

import java.util.ArrayList;

import com.android.volley.JsonObjectRequest;

public class MainActivity extends AppCompatActivity {

  private ListView mListView;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    mListView = (ListView) findViewById(R.id.recipe_list_view);

    String url = "http://my-json-feed";

    JsonObjectRequest jsObjRequest = new JsonObjectRequest
            (DownloadManager.Request.Method.GET, url, null, new Downloader.Response.Listener<JSONObject>() {

              @Override
              public void onResponse(JSONObject response) {
                mTxtDisplay.setText("Response: " + response.toString());
              }
            }, new Response.ErrorListener() {

              @Override
              public void onErrorResponse(VolleyError error) {
                // TODO Auto-generated method stub

              }
            });


    final ArrayList<Sermon> sermonList = Sermon.getRecipesFromFile("recipes.json", this);
    SermonAdapter adapter = new SermonAdapter(this, sermonList);
    mListView.setAdapter(adapter);
  }

}
