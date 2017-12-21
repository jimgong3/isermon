//
//  SermonTableViewCell.swift
//  isermon
//
//  Created by jim on 12/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import UIKit

class SermonTableViewCell: UITableViewCell {
    
    //MARK: Properties
    @IBOutlet weak var title: UILabel!
    @IBOutlet weak var desc: UITextView!
    //    @IBOutlet weak var desc: UILabel!
    //    @IBOutlet weak var speaker: UILabel!
//    @IBOutlet weak var scripture: UILabel!
//    @IBOutlet weak var info: UILabel!
    @IBOutlet weak var remarks: UILabel!
//    @IBOutlet weak var month: UILabel!
//    @IBOutlet weak var day: UILabel!
//    @IBOutlet weak var lang: UILabel!
//    @IBOutlet weak var duration: UILabel!
    
    @IBOutlet weak var play: UIButton!
//    @IBOutlet weak var stop: UIButton!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)        
        // Configure the view for the selected state
    }
    
}
