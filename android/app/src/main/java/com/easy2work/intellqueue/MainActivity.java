package com.easy2work.intellqueue;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import android.graphics.Color;
import android.view.View;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		// Enable edge-to-edge content and control insets ourselves
		WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

		// Make system bars transparent for a native edge-to-edge look
		getWindow().setStatusBarColor(Color.TRANSPARENT);
		getWindow().setNavigationBarColor(Color.TRANSPARENT);

		// Use dark icons on light backgrounds ("light" system bars appearance)
		View decorView = getWindow().getDecorView();
		WindowInsetsControllerCompat insetsController = new WindowInsetsControllerCompat(getWindow(), decorView);
		insetsController.setAppearanceLightStatusBars(true);
		insetsController.setAppearanceLightNavigationBars(true);
	}
}
