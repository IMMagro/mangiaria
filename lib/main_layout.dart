import 'package:flutter/material.dart';
import 'theme.dart';
import 'home_screen.dart';
import 'shopping_screen.dart';

class MainLayout extends StatefulWidget {
  @override
  _MainLayoutState createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    HomeScreen(),
    PlaceholderScreen(title: "Stats"),
    ShoppingScreen(),
    PlaceholderScreen(title: "Profilo"),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: _screens,
          ),
          
          // Custom Bottom Nav
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: ClipRRect(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.85),
                  border: Border(top: BorderSide(color: AppColors.borderLight)),
                ),
                padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom + 12, top: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _buildNavItem(0, Icons.home_filled, "Home"),
                    _buildNavItem(1, Icons.bar_chart_rounded, "Stats"),
                    
                    // FAB
                    GestureDetector(
                      onTap: () {
                        // Azione FAB (es. aggiungi pasto libero o genera spesa)
                      },
                      child: Container(
                        width: 56,
                        height: 56,
                        margin: EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF27C882), Color(0xFF1AA86A)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Color(0xFF27C882).withOpacity(0.4),
                              blurRadius: 24,
                              offset: Offset(0, 8),
                            )
                          ],
                        ),
                        child: Icon(Icons.add, color: Colors.white, size: 32),
                      ),
                    ),
                    
                    _buildNavItem(2, Icons.shopping_bag_outlined, "Spesa"),
                    _buildNavItem(3, Icons.person_outline, "Profilo"),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    bool isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() => _currentIndex = index);
      },
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isActive ? AppColors.accent : AppColors.textSecondary,
            size: 24,
          ),
          SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: isActive ? AppColors.accent : AppColors.textSecondary,
            ),
          ),
          SizedBox(height: 4),
          Container(
            width: 4,
            height: 4,
            decoration: BoxDecoration(
              color: isActive ? AppColors.accent : Colors.transparent,
              shape: BoxShape.circle,
            ),
          )
        ],
      ),
    );
  }
}

class PlaceholderScreen extends StatelessWidget {
  final String title;
  const PlaceholderScreen({required this.title});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(title, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
    );
  }
}
