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
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
        if let sermonTableViewController = segue.destination as? SermonTableViewController {
            print("destination: SermonTableViewController")
            let button = sender as? UIButton
            if let username = Me.sharedInstance.username {
                if button?.titleLabel?.text?.range(of: "收藏") != nil{
                    sermonTableViewController.bookmarkedByUsername = username
                } else if button?.titleLabel?.text?.range(of: "上傳") != nil{
                    sermonTableViewController.uploadedByUsername = username
                }
            } else {
                let alert = UIAlertController(title: "提示", message: "請先登錄。", preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: NSLocalizedString("好", comment: "Default action"), style: .`default`, handler: { _ in
                    NSLog("The \"OK\" alert occured.")
                }))
                self.present(alert, animated: true, completion: nil)
            }
        }

    }
    

}
