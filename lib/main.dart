import 'package:flutter/material.dart';
import 'main_layout.dart';

void main() {
  runApp(MangiariaApp());
}

class MangiariaApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mangiaria',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MainLayout(),
      debugShowCheckedModeBanner: false,
    );
  }
}

