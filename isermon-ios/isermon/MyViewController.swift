//
//  MyViewController.swift
//  isermon
//
//  Created by jim on 21/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import UIKit

class MyViewController: UIViewController {

    @IBOutlet weak var username: UITextField!
    @IBOutlet weak var email: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
     }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        if Me.sharedInstance.username != nil && Me.sharedInstance.username != "" {
            username.text = Me.sharedInstance.username
        } else {
			username.text = "guest"		//default
		}
        if Me.sharedInstance.email != nil {
            email.text = Me.sharedInstance.email
        }
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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
