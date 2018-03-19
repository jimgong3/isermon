package com.jimgong.isermon;

import android.app.Application;
import android.content.Context;

/**
 * Created by jenny on 5/3/2018.
 */

public class MyApplication extends Application {

    private static Context context;

    public void onCreate() {
        super.onCreate();
        MyApplication.context = getApplicationContext();
    }

    public static Context getAppContext() {
        return MyApplication.context;
    }
}