import 'package:flutter/material.dart';

class AppColors {
  static const bg = Color(0xFFF0EDE8);
  static const textPrimary = Color(0xFF1C1915);
  static const textSecondary = Color(0xFF9A9187);
  static const accent = Color(0xFF27C882);
  
  static const surfaceWhite = Colors.white;
  static const borderLight = Color(0x0D000000); // black/5
  static const divider = Color(0xFFEAE6E0);

  // Category Colors
  static const catCarbs = Color(0xFF27C882);
  static const catProtein = Color(0xFF6366F1);
  static const catVeg = Color(0xFF22C55E);
  static const catPantry = Color(0xFFF59E0B);
}

class AppTheme {
  static ThemeData get light {
    return ThemeData(
      scaffoldBackgroundColor: AppColors.bg,
      fontFamily: 'Roboto', // Sostituire con il font custom se disponibile
      primaryColor: AppColors.accent,
      textTheme: TextTheme(
        bodyLarge: TextStyle(color: AppColors.textPrimary),
        bodyMedium: TextStyle(color: AppColors.textPrimary),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surfaceWhite,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
    );
  }
}
