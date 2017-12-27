//
//  MyTabBarController.swift
//  isermon
//
//  Created by jim on 27/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import UIKit

class MyTabBarController: UITabBarController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
//        print("Selected Index :\(self.selectedIndex)");
//        selectedTabIndex = self.selectedIndex
        
        if item == (self.tabBar.items as! [UITabBarItem])[0]{
            print("MyTabBarController>> selected tab 0")
            selectedTabIndex = 0
        } else if item == (self.tabBar.items as! [UITabBarItem])[1]{
            print("MyTabBarController>> selected tab 1")
            selectedTabIndex = 1
        } else if item == (self.tabBar.items as! [UITabBarItem])[2]{
            print("MyTabBarController>> selected tab 2")
            selectedTabIndex = 2
        } else if item == (self.tabBar.items as! [UITabBarItem])[3]{
            print("MyTabBarController>> selected tab 3")
            selectedTabIndex = 3
        }
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
