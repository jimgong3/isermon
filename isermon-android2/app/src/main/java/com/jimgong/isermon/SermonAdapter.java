package com.jimgong.isermon;

import android.content.Context;
import android.media.MediaPlayer;
import android.os.Handler;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.SeekBar;
import android.widget.TextView;

import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;

/**
 * Created by jim on 22/1/2018.
 */

public class SermonAdapter extends BaseAdapter {

    private Context mContext;
    private LayoutInflater mInflater;
    private ArrayList<Sermon> mDataSource;

    MediaPlayer player;
    private final String TEXT_PLAY = "播放";
    private final String TEXT_PAUSE = "暫停";
    String currentPlayingSermonId;
    int lastPlayingPosition;
    TextView lastPlay;
    String currentPlayingTotalTime;

    public SeekBar mSeekBar;
    public TextView mNowPlayingTitle;
    public TextView mNowPlayingTime;
    private Handler mHandler = new Handler();;
    private boolean isPlaying = false;

    public SermonAdapter(Context context, ArrayList<Sermon> items) {
        mContext = context;
        mDataSource = items;
        mInflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);

//        mSeekBar = (SeekBar) findViewById(R.id.seekBar);
    }

    public SermonAdapter(ArrayList<Sermon> items) {
        mContext = MyApplication.getAppContext();
        mDataSource = items;
        mInflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }

    @Override
    public int getCount() {
        return mDataSource.size();
    }

    @Override
    public Object getItem(int position) {
        return mDataSource.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        final View rowView = mInflater.inflate(R.layout.list_item_sermon, parent, false);
        final TextView titleTextView = (TextView) rowView.findViewById(R.id.sermon_title);
        final TextView descriptionTextView = (TextView) rowView.findViewById(R.id.sermon_description);
        final TextView remarksTextView = (TextView) rowView.findViewById(R.id.sermon_remarks);
        final TextView playTextView = (TextView) rowView.findViewById(R.id.sermon_play);

        final Sermon sermon = (Sermon) getItem(position);

        titleTextView.setText(sermon.title);
        descriptionTextView.setText(sermon.description);

        String remarks = " | ";
        if(sermon.username != "")
            remarks = sermon.username + remarks;
        if(sermon.date != "")
            remarks = remarks + sermon.date;
        remarksTextView.setText(remarks);

        playTextView.setText(TEXT_PLAY);
        playTextView.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                if (playTextView.getText().equals(TEXT_PLAY)) {
                    playTextView.setText(TEXT_PAUSE);
                    Log.d("SermonAdapter", "click to play...");
                    isPlaying = true;

                    if(currentPlayingSermonId == null) {
                        Log.d("SermonAdapter", "play for the 1st time...");
                        currentPlayingSermonId = sermon.id;
                        mNowPlayingTitle.setText(sermon.title);
                        lastPlay = playTextView;
                        Log.d("SermonAdapter", "set current playing id: " + sermon.id);
                        player = new MediaPlayer();
                        try {
                            Log.d("SermonAdapter", "URL: " + sermon.urlLocal);
                            player.setDataSource(sermon.urlLocal);
                            player.prepare();
                            player.start();

                            mSeekBar.setProgress(0);
                            mSeekBar.setMax(player.getDuration());
                            currentPlayingTotalTime = positionToTime(player.getDuration());
                            Log.d("SermonAdapter", "reset seekbar max: " + positionToTime(player.getDuration()));
                            updateSeekBar();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    } else {
                        if(sermon.id == currentPlayingSermonId){
                            Log.d("SermonAdapter", "contine playing: " + currentPlayingSermonId);
                            player.seekTo(lastPlayingPosition);
                            Log.d("SermonAdapter", "seek to position: " + lastPlayingPosition);
                            player.start();
                        } else {
                            Log.d("SermonAdapter", "switch to play another: " + sermon.id);
                            player.pause();
                            lastPlay.setText(TEXT_PLAY);
                            lastPlay = playTextView;
                            Log.d("SermonAdapter", "pause the previous play, set button text");
                            currentPlayingSermonId = sermon.id;
                            mNowPlayingTitle.setText(sermon.title);
                            player = new MediaPlayer();
                            try {
                                Log.d("SermonAdapter", "URL: " + sermon.urlLocal);
                                player.setDataSource(sermon.urlLocal);
                                player.prepare();
                                player.start();

                                mSeekBar.setProgress(0);
                                mSeekBar.setMax(player.getDuration());
                                currentPlayingTotalTime = positionToTime(player.getDuration());
                                Log.d("SermonAdapter", "reset seekbar max: " + positionToTime(player.getDuration()));
                                updateSeekBar();
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        }
                    }
                } else {
                    Log.d("SermonAdapter", "click to pause...");
                    isPlaying = false;
                    playTextView.setText(TEXT_PLAY);
                    player.pause();
                    lastPlayingPosition = player.getCurrentPosition();
                    Log.d("SermonAdapter", "save last playing position: " + lastPlayingPosition);
                }
            }
        });

        return rowView;
    }

    void updateSeekBar() {
        mHandler.postDelayed(mUpdateTimeTask, 100);
    }

    Runnable mUpdateTimeTask = new Runnable() {
        public void run() {
            if(isPlaying) {
                long currentPosition = player.getCurrentPosition();
                String hms = positionToTime(currentPosition);
                Log.d("SermonAdapter", "current time: " + hms);
                mSeekBar.setProgress((int) currentPosition);
                mNowPlayingTime.setText(hms + " / " + currentPlayingTotalTime);
                mHandler.postDelayed(this, 1000);
            }
        }
    };

    String positionToTime(long millis){
        if(TimeUnit.MILLISECONDS.toHours(millis) > 0){
            String hms = String.format("%02d:%02d:%02d",
                    TimeUnit.MILLISECONDS.toHours(millis),
                    TimeUnit.MILLISECONDS.toMinutes(millis) % TimeUnit.HOURS.toMinutes(1),
                    TimeUnit.MILLISECONDS.toSeconds(millis) % TimeUnit.MINUTES.toSeconds(1));
            return hms;
        } else {
            String hms = String.format("%02d:%02d",
                    TimeUnit.MILLISECONDS.toMinutes(millis),
                    TimeUnit.MILLISECONDS.toSeconds(millis) % TimeUnit.MINUTES.toSeconds(1));
            return hms;
        }
    }

    public void playCurrent(){
        if(isPlaying) {
            Log.d("SermonAdapter", "pause current");
            player.pause();
            isPlaying = false;
        } else {
            if (currentPlayingSermonId != null) {
                Log.d("SermonAdapter", "play current");
                player.start();
                isPlaying = true;
            } else {
                Log.e("SermonAdapter", "please choose a sermon to play");
            }
        }
    }
}
