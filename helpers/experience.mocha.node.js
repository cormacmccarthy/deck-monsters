const { expect } = require('../shared/test-setup');

const { xpFormula, getAverageLevel, calculateXP } = require('./experience');

describe.only('./helpers/experience.js', () => {
	describe('xpFormula works', () => {
		it('calculates base 1 correctly', () => {
			expect(xpFormula(0, 1)).to.equal(1);
			expect(xpFormula(1, 1)).to.equal(1);
			expect(xpFormula(2, 1)).to.equal(0);
			expect(xpFormula(3, 1)).to.equal(0);
			expect(xpFormula(4, 1)).to.equal(0);
			expect(xpFormula(5, 1)).to.equal(0);
		});

		it('calculates base 2 correctly', () => {
			expect(xpFormula(0, 2)).to.equal(2);
			expect(xpFormula(1, 2)).to.equal(1);
			expect(xpFormula(2, 2)).to.equal(1);
			expect(xpFormula(3, 2)).to.equal(0);
			expect(xpFormula(4, 2)).to.equal(0);
			expect(xpFormula(5, 2)).to.equal(0);
		});

		it('calculates base 3 correctly', () => {
			expect(xpFormula(0, 3)).to.equal(3);
			expect(xpFormula(1, 3)).to.equal(2);
			expect(xpFormula(2, 3)).to.equal(1);
			expect(xpFormula(3, 3)).to.equal(0);
			expect(xpFormula(4, 3)).to.equal(0);
			expect(xpFormula(5, 3)).to.equal(0);
		});

		it('calculates base 10 correctly', () => {
			expect(xpFormula(0, 10)).to.equal(10);
			expect(xpFormula(1, 10)).to.equal(5);
			expect(xpFormula(2, 10)).to.equal(3);
			expect(xpFormula(3, 10)).to.equal(1);
			expect(xpFormula(4, 10)).to.equal(1);
			expect(xpFormula(5, 10)).to.equal(0);
		});
	});
	describe('getAverageLevel works', () => {
		it('calculates averages for level 1 monsters correctly', () => {
			const contestants = [
				{
					monster: {
						level: 1
					}
				},
				{
					monster: {
						level: 1
					}
				},
				{
					monster: {
						level: 1
					}
				},
				{
					monster: {
						level: 1
					}
				},
				{
					monster: {
						level: 1
					}
				}
			];

			expect(getAverageLevel(contestants[0].monster, contestants)).to.equal(1);
		});

		it('calculates averages for level 5 monsters correctly', () => {
			const contestants = [
				{
					monster: {
						level: 5
					}
				},
				{
					monster: {
						level: 5
					}
				},
				{
					monster: {
						level: 5
					}
				},
				{
					monster: {
						level: 5
					}
				},
				{
					monster: {
						level: 5
					}
				}
			];

			expect(getAverageLevel(contestants[0].monster, contestants)).to.equal(5);
		});

		it('calculates averages for disparate level monsters correctly', () => {
			const contestants = [
				{
					monster: {
						level: 5
					}
				},
				{
					monster: {
						level: 4
					}
				},
				{
					monster: {
						level: 3
					}
				},
				{
					monster: {
						level: 2
					}
				},
				{
					monster: {
						level: 1
					}
				}
			];

			expect(getAverageLevel(contestants[0].monster, contestants)).to.equal(3);
		});
	});
	describe('calculateXP in 1:1 battles', () => {
		describe('calculate XP for winner', () => {
			it('assigns 13 XP if you kill a same level monster', () => {
				const constestant1 = {
					monster: {
						level: 1,
						givenName: 'fred'
					}
				};
				const constestant2 = {
					monster: {
						level: 1
					},
					killed: [constestant1.monster]
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP, reasons } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(13);
				expect(reasons).to.equal('gained 10 for killing fred (0 level difference)\ngained 3 for last one standing in battle with opponents with average level of 1');
			});

			it('assigns 25 XP if you kill a 1 level higher monster', () => {
				const constestant1 = {
					monster: {
						level: 2
					}
				};
				const constestant2 = {
					monster: {
						level: 1
					},
					killed: [constestant1.monster]
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(25);
			});

			it('assigns 7 XP if you kill a 1 level lower monster', () => {
				const constestant1 = {
					monster: {
						level: 1
					}
				};
				const constestant2 = {
					monster: {
						level: 2
					},
					killed: [constestant1.monster]
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(7);
			});

			it('assigns no XP if you kill a monster that is 5 or more levels lower', () => {
				const constestant1 = {
					monster: {
						level: 0
					}
				};
				const constestant2 = {
					monster: {
						level: 6
					},
					killed: [constestant1.monster]
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(0);
			});
		});

		describe('calculate XP for loser', () => {
			it('assigns 1 XP if level 1 monster is killed by same level monster', () => {
				const constestant1 = {
					monster: {
						level: 1,
						givenName: 'fred'
					}
				};
				const constestant2 = {
					monster: {
						level: 1
					},
					killedBy: constestant1.monster
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP, reasons } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(1);
				expect(reasons).to.equal('gained 1 for being killed by fred (0 level difference)');
			});

			it('assigns 1 XP if level 100 monster is killed by same level monster', () => {
				const constestant1 = {
					monster: {
						level: 100
					}
				};
				const constestant2 = {
					monster: {
						level: 100
					},
					killedBy: constestant1.monster
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(1);
			});

			it('assigns 1 XP if you are killed by 1 level lower monster', () => {
				const constestant1 = {
					monster: {
						level: 1
					}
				};
				const constestant2 = {
					monster: {
						level: 2
					},
					killedBy: constestant1.monster
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(1);
			});

			it('assigns no XP if you are killed by 4 level lower monster', () => {
				const constestant1 = {
					monster: {
						level: 1
					}
				};
				const constestant2 = {
					monster: {
						level: 5
					},
					killedBy: constestant1.monster
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(0);
			});

			it('assigns 2 XP if you are killed by 1 level higher monster', () => {
				const constestant1 = {
					monster: {
						level: 2
					}
				};
				const constestant2 = {
					monster: {
						level: 1
					},
					killedBy: constestant1.monster
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(2);
			});

			it('assigns 16 XP if you are killed by 4 level higher monster', () => {
				const constestant1 = {
					monster: {
						level: 5
					}
				};
				const constestant2 = {
					monster: {
						level: 1
					},
					killedBy: constestant1.monster
				};

				const contestants = [constestant1, constestant2];

				const { gainedXP } = calculateXP(constestant2, contestants);
				expect(gainedXP).to.equal(16);
			});
		});

		describe('calculate XP for flee', () => {
			it('assigns more xp to the monster that stays than the monster that flees', () => {
				const constestant1 = {
					monster: {
						level: 1
					}
				};
				const constestant2 = {
					monster: {
						level: 1
					},
					fled: true
				};

				const contestants = [constestant1, constestant2];

				let { gainedXP, reasons } = calculateXP(constestant1, contestants);
				expect(gainedXP).to.equal(3);
				expect(reasons).to.equal('gained 3 for last one standing in battle with opponents with average level of 1');
				({ gainedXP, reasons } = calculateXP(constestant2, contestants));
				expect(gainedXP).to.equal(2);
				expect(reasons).to.equal('gained 2 for fleeing in battle with opponents with average level of 1');
			});

			it('assigns more xp to the monster that stays when both are level 100', () => {
				const constestant1 = {
					monster: {
						level: 100
					}
				};
				const constestant2 = {
					monster: {
						level: 100
					},
					fled: true
				};

				const contestants = [constestant1, constestant2];

				let { gainedXP } = calculateXP(constestant1, contestants);
				expect(gainedXP).to.equal(3);
				({ gainedXP } = calculateXP(constestant2, contestants));
				expect(gainedXP).to.equal(2);
			});

			it('assigns 5 xp if a monster 1 level higher flees you', () => {
				const constestant1 = {
					monster: {
						level: 1
					}
				};
				const constestant2 = {
					monster: {
						level: 2
					},
					fled: true
				};

				const contestants = [constestant1, constestant2];

				let { gainedXP } = calculateXP(constestant1, contestants);
				expect(gainedXP).to.equal(5);
				({ gainedXP } = calculateXP(constestant2, contestants));
				expect(gainedXP).to.equal(1);
			});

			it('assigns 5 XP if a monster 4 levels higher flees you after 1 round', () => {
				const constestant1 = {
					monster: {
						level: 1
					}
				};
				const constestant2 = {
					monster: {
						level: 5
					},
					fled: true
				};

				const contestants = [constestant1, constestant2];

				let { gainedXP } = calculateXP(constestant1, contestants);
				expect(gainedXP).to.equal(5);
				({ gainedXP } = calculateXP(constestant2, contestants));
				expect(gainedXP).to.equal(0);
			});

			it('assigns 15 XP if a monster 4 levels higher flees you after 3 rounds', () => {
				const constestant1 = {
					monster: {
						level: 1
					},
					rounds: 3
				};
				const constestant2 = {
					monster: {
						level: 5
					},
					fled: true,
					rounds: 3
				};

				const contestants = [constestant1, constestant2];

				let { gainedXP } = calculateXP(constestant1, contestants);
				expect(gainedXP).to.equal(15);
				({ gainedXP } = calculateXP(constestant2, contestants));
				expect(gainedXP).to.equal(0);
			});

			it('assigns 5 XP if you flee a monster 4 levels higher', () => {
				const constestant1 = {
					monster: {
						level: 5
					}
				};
				const constestant2 = {
					monster: {
						level: 1
					},
					fled: true
				};

				const contestants = [constestant1, constestant2];

				let { gainedXP } = calculateXP(constestant1, contestants);
				expect(gainedXP).to.equal(0);
				({ gainedXP } = calculateXP(constestant2, contestants));
				expect(gainedXP).to.equal(5);
			});
		});
	});
	describe('calculateXP in 5:5 battles', () => {
		it('assigns proper xp to winners and losers if one beats all', () => {
			const constestant1 = {
				monster: {
					level: 1
				}
			};
			const constestant2 = {
				monster: {
					level: 1
				}
			};
			const constestant3 = {
				monster: {
					level: 1
				}
			};
			const constestant4 = {
				monster: {
					level: 1
				}
			};
			const constestant5 = {
				monster: {
					level: 1
				},
				killed: [
					constestant1.monster,
					constestant2.monster,
					constestant3.monster,
					constestant4.monster
				]
			};
			constestant1.killedBy = constestant5.monster;
			constestant2.killedBy = constestant5.monster;
			constestant3.killedBy = constestant5.monster;
			constestant4.killedBy = constestant5.monster;

			const contestants = [constestant1, constestant2, constestant3, constestant4, constestant5];

			let { gainedXP } = calculateXP(constestant1, contestants);
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant2, contestants));
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant3, contestants));
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant4, contestants));
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant5, contestants));
			expect(gainedXP).to.equal(43);
		});

		it('assigns proper xp if 4 beat 1 all same level', () => {
			const constestant1 = {
				monster: {
					level: 1
				}
			};
			const constestant2 = {
				monster: {
					level: 1,
					givenName: 'fred'
				}
			};
			const constestant3 = {
				monster: {
					level: 1
				}
			};
			const constestant4 = {
				monster: {
					level: 1,
					givenName: 'sonka'
				}
			};
			const constestant5 = {
				monster: {
					level: 1
				}
			};
			constestant1.killedBy = constestant2.monster;
			constestant2.killedBy = constestant3.monster;
			constestant2.killed = [constestant1.monster];
			constestant3.killedBy = constestant4.monster;
			constestant3.killed = [constestant2.monster];
			constestant4.killedBy = constestant5.monster;
			constestant4.killed = [constestant3.monster];
			constestant5.killed = [constestant4.monster];

			const contestants = [constestant1, constestant2, constestant3, constestant4, constestant5];

			let { gainedXP } = calculateXP(constestant1, contestants);
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant2, contestants));
			expect(gainedXP).to.equal(11);
			({ gainedXP, reasons } = calculateXP(constestant3, contestants));
			expect(gainedXP).to.equal(11);
			expect(reasons).to.equal('gained 10 for killing fred (0 level difference)\ngained 1 for being killed by sonka (0 level difference)');
			({ gainedXP } = calculateXP(constestant4, contestants));
			expect(gainedXP).to.equal(11);
			({ gainedXP } = calculateXP(constestant5, contestants));
			expect(gainedXP).to.equal(13);
		});

		it('assigns proper xp to winners and losers if one beats all all different levels', () => {
			const constestant1 = {
				monster: {
					level: 1,
					givenName: 'fred'
				}
			};
			const constestant2 = {
				monster: {
					level: 2,
					givenName: 'barney'
				}
			};
			const constestant3 = {
				monster: {
					level: 3,
					givenName: 'betty'
				}
			};
			const constestant4 = {
				monster: {
					level: 4,
					givenName: 'wilma'
				}
			};
			const constestant5 = {
				monster: {
					level: 5
				},
				killed: [
					constestant1.monster,
					constestant2.monster,
					constestant3.monster,
					constestant4.monster
				]
			};
			constestant1.killedBy = constestant5.monster;
			constestant2.killedBy = constestant5.monster;
			constestant3.killedBy = constestant5.monster;
			constestant4.killedBy = constestant5.monster;

			const contestants = [constestant1, constestant2, constestant3, constestant4, constestant5];

			let { gainedXP } = calculateXP(constestant1, contestants);
			expect(gainedXP).to.equal(16);
			({ gainedXP } = calculateXP(constestant2, contestants));
			expect(gainedXP).to.equal(8);
			({ gainedXP } = calculateXP(constestant3, contestants));
			expect(gainedXP).to.equal(4);
			({ gainedXP } = calculateXP(constestant4, contestants));
			expect(gainedXP).to.equal(2);
			({ gainedXP, reasons } = calculateXP(constestant5, contestants));
			expect(gainedXP).to.equal(11);
			expect(reasons).to.equal('gained 1 for killing fred (4 level difference)\ngained 1 for killing barney (3 level difference)\ngained 3 for killing betty (2 level difference)\ngained 5 for killing wilma (1 level difference)\ngained 1 for last one standing in battle with opponents with average level of 3');
		});

		it('assigns proper xp if 4 beat 1 all different levels', () => {
			const constestant1 = {
				monster: {
					level: 1
				}
			};
			const constestant2 = {
				monster: {
					level: 2
				}
			};
			const constestant3 = {
				monster: {
					level: 3
				}
			};
			const constestant4 = {
				monster: {
					level: 4
				}
			};
			const constestant5 = {
				monster: {
					level: 5
				}
			};
			constestant1.killedBy = constestant2.monster;
			constestant2.killedBy = constestant3.monster;
			constestant2.killed = [constestant1.monster];
			constestant3.killedBy = constestant4.monster;
			constestant3.killed = [constestant2.monster];
			constestant4.killedBy = constestant5.monster;
			constestant4.killed = [constestant3.monster];
			constestant5.killed = [constestant4.monster];

			const contestants = [constestant1, constestant2, constestant3, constestant4, constestant5];

			let { gainedXP } = calculateXP(constestant1, contestants);
			expect(gainedXP).to.equal(2);
			({ gainedXP } = calculateXP(constestant2, contestants));
			expect(gainedXP).to.equal(7);
			({ gainedXP } = calculateXP(constestant3, contestants));
			expect(gainedXP).to.equal(7);
			({ gainedXP } = calculateXP(constestant4, contestants));
			expect(gainedXP).to.equal(7);
			({ gainedXP } = calculateXP(constestant5, contestants));
			expect(gainedXP).to.equal(6);
		});

		it('assigns proper xp with mix of flee and kills all same level', () => {
			const constestant1 = {
				monster: {
					level: 1
				}
			};
			const constestant2 = {
				monster: {
					level: 1
				}
			};
			const constestant3 = {
				monster: {
					level: 1
				}
			};
			const constestant4 = {
				monster: {
					level: 1
				},
				fled: true
			};
			const constestant5 = {
				monster: {
					level: 1
				},
				fled: true
			};
			constestant1.killedBy = constestant2.monster;
			constestant2.killedBy = constestant3.monster;
			constestant2.killed = [constestant1.monster];
			constestant3.killed = [constestant2.monster];


			const contestants = [constestant1, constestant2, constestant3, constestant4, constestant5];

			let { gainedXP } = calculateXP(constestant1, contestants);
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant2, contestants));
			expect(gainedXP).to.equal(11);
			({ gainedXP } = calculateXP(constestant3, contestants));
			expect(gainedXP).to.equal(13);
			({ gainedXP } = calculateXP(constestant4, contestants));
			expect(gainedXP).to.equal(2);
			({ gainedXP } = calculateXP(constestant5, contestants));
			expect(gainedXP).to.equal(2);
		});

		it('assigns proper xp with mix of flee and kills all different levels', () => {
			const constestant1 = {
				monster: {
					level: 1
				}
			};
			const constestant2 = {
				monster: {
					level: 2
				}
			};
			const constestant3 = {
				monster: {
					level: 3
				}
			};
			const constestant4 = {
				monster: {
					level: 4
				},
				fled: true
			};
			const constestant5 = {
				monster: {
					level: 5
				},
				fled: true
			};
			constestant1.killedBy = constestant2.monster;
			constestant2.killedBy = constestant3.monster;
			constestant2.killed = [constestant1.monster];
			constestant3.killed = [constestant2.monster];


			const contestants = [constestant1, constestant2, constestant3, constestant4, constestant5];

			let { gainedXP } = calculateXP(constestant1, contestants);
			expect(gainedXP).to.equal(2);
			({ gainedXP } = calculateXP(constestant2, contestants));
			expect(gainedXP).to.equal(7);
			({ gainedXP } = calculateXP(constestant3, contestants));
			expect(gainedXP).to.equal(8);
			({ gainedXP } = calculateXP(constestant4, contestants));
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant5, contestants));
			expect(gainedXP).to.equal(1);
		});

		it('assigns proper xp with flee all different levels after 1 round', () => {
			const constestant1 = {
				monster: {
					level: 1
				}
			};
			const constestant2 = {
				monster: {
					level: 2
				},
				fled: true
			};
			const constestant3 = {
				monster: {
					level: 3
				},
				fled: true
			};
			const constestant4 = {
				monster: {
					level: 4
				},
				fled: true
			};
			const constestant5 = {
				monster: {
					level: 5
				},
				fled: true
			};


			const contestants = [constestant1, constestant2, constestant3, constestant4, constestant5];

			let { gainedXP } = calculateXP(constestant1, contestants);
			expect(gainedXP).to.equal(5);
			({ gainedXP } = calculateXP(constestant2, contestants));
			expect(gainedXP).to.equal(5);
			({ gainedXP } = calculateXP(constestant3, contestants));
			expect(gainedXP).to.equal(2);
			({ gainedXP } = calculateXP(constestant4, contestants));
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant5, contestants));
			expect(gainedXP).to.equal(1);
		});

		it('assigns proper xp with flee all different levels after 3 rounds', () => {
			const constestant1 = {
				monster: {
					level: 1
				},
				rounds: 3
			};
			const constestant2 = {
				monster: {
					level: 2
				},
				fled: true,
				rounds: 3
			};
			const constestant3 = {
				monster: {
					level: 3
				},
				fled: true,
				rounds: 3
			};
			const constestant4 = {
				monster: {
					level: 4
				},
				fled: true,
				rounds: 3
			};
			const constestant5 = {
				monster: {
					level: 5
				},
				fled: true,
				rounds: 3
			};


			const contestants = [constestant1, constestant2, constestant3, constestant4, constestant5];

			let { gainedXP } = calculateXP(constestant1, contestants);
			expect(gainedXP).to.equal(15);
			({ gainedXP } = calculateXP(constestant2, contestants));
			expect(gainedXP).to.equal(8);
			({ gainedXP } = calculateXP(constestant3, contestants));
			expect(gainedXP).to.equal(2);
			({ gainedXP } = calculateXP(constestant4, contestants));
			expect(gainedXP).to.equal(1);
			({ gainedXP } = calculateXP(constestant5, contestants));
			expect(gainedXP).to.equal(1);
		});
	});
});
