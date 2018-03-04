package com.jimgong.isermon;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import java.util.ArrayList;

/**
 * Created by jim on 22/1/2018.
 */

public class SermonAdapter extends BaseAdapter {

    private Context mContext;
    private LayoutInflater mInflater;
    private ArrayList<Sermon> mDataSource;

    public SermonAdapter(Context context, ArrayList<Sermon> items) {
        mContext = context;
        mDataSource = items;
        mInflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
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
        // Get view for row item
        View rowView = mInflater.inflate(R.layout.list_item_sermon, parent, false);

        // Get title element
        TextView titleTextView =
                (TextView) rowView.findViewById(R.id.recipe_list_title);

        // Get description element
        TextView descriptionTextView =
                (TextView) rowView.findViewById(R.id.recipe_list_description);

        // Get description element
        TextView playTextView =
                (TextView) rowView.findViewById(R.id.recipe_list_play);

        Sermon sermon = (Sermon) getItem(position);

        titleTextView.setText(sermon.title);
        descriptionTextView.setText(sermon.description);
        playTextView.setText("Play");

        return rowView;
    }

}
