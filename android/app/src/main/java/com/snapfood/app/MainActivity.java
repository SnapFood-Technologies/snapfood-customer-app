package com.snapfood.app;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import org.devio.rn.splashscreen.SplashScreen;
import android.os.Bundle;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.AppTheme); // Now set the theme from Splash to App before setContentView
        setContentView(R.layout.launch_screen); // Then inflate the new view
        SplashScreen.show(this); // Now show the splash screen. Hide it later in JS
        super.onCreate(savedInstanceState);
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Snapfood";
    }

    @Override
    public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    }
}
