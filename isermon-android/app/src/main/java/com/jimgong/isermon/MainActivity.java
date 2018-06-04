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

import android.media.MediaPlayer;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.SeekBar;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {

    private ListView mListView;
    private SermonAdapter adapter;
    private ArrayList<Sermon> sermonList;

    private MediaPlayer player;
    private SeekBar mSeekBar;
    public TextView mNowPlayingTitle;
    public TextView mNowPlayingTime;
    public TextView mPlayNow;

    private final String NOW_PLAYING = "正在播放: ";
    private final String TEXT_PLAY = "播放";
    private final String TEXT_PAUSE = "暫停";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mListView = (ListView) findViewById(R.id.sermon_list);
        mSeekBar = (SeekBar) findViewById(R.id.seekBar);
        mNowPlayingTitle = (TextView) findViewById(R.id.now_playing_title);
        mNowPlayingTime = (TextView) findViewById(R.id.now_playing_time);
        mPlayNow = (TextView) findViewById(R.id.play_current);
        mPlayNow.setText(TEXT_PLAY);

        // Instantiate the RequestQueue.
        String url = Config.URL_PREFIX + Config.SERVER_IP + ":" + Config.SERVER_PORT + "/sermons";
        StringRequest stringRequest = new StringRequest(Request.Method.GET, url,
                new Response.Listener<String>() {
                    @Override
                    public void onResponse(String response) {
                        // Display the first 500 characters of the response string.
                        Log.d("main","Response is: "+ response.substring(0,500));

                        sermonList = Sermon.getFromResponse(response);
                        adapter = new SermonAdapter(sermonList);
                        adapter.mSeekBar = mSeekBar;
                        adapter.mNowPlayingTitle = mNowPlayingTitle;
                        adapter.mNowPlayingTime = mNowPlayingTime;
                        adapter.mPlayNow = mPlayNow;

                        mListView.setAdapter(adapter);
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.e("Main", "error getting response from server: " + error);
                    }
                });

        RequestQueue queue = Volley.newRequestQueue(this);
        queue.add(stringRequest);

        final TextView titleTextView = (TextView) findViewById(R.id.now_playing);
        titleTextView.setText(NOW_PLAYING);

        mSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                Log.d("main", "seekbar progress changed: " + progress + "ms");
                adapter.player.seekTo(progress);

                String hms = SermonAdapter.positionToTime(progress);
                Log.d("main", "change to time: " + hms);
                mNowPlayingTime.setText(hms + " / " + adapter.currentPlayingTotalTime);
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
            }
        });
    }

//    public void onPlay(View v){
//        Log.d("Main", "onPlay start...");
//    }

    public void playCurrent(View v){
        Log.d("MainActivity", "click play/pause current...");
        adapter.playCurrent();
    }
}
